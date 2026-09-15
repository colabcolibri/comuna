// @vitest-environment node
import net from 'net';
import { describe, expect, it } from 'vitest';
import { formatReplyToHeader, sendSmtpMail } from './smtp';

function captureSmtp(send: (port: number) => Promise<void>): Promise<string> {
  const received: string[] = [];
  return new Promise((resolve, reject) => {
    const server = net.createServer((socket) => {
      let inData = false;
      socket.write('220 test ESMTP\r\n');
      socket.on('data', (chunk) => {
        const text = chunk.toString();
        received.push(text);
        if (inData) {
          if (/\r\n\.\r\n/.test(text) || text === '.\r\n') {
            inData = false;
            socket.write('250 ok\r\n');
          }
          return;
        }
        const lines = text.split(/\r\n/).filter(Boolean);
        for (const line of lines) {
          const verb = line.split(' ')[0].toUpperCase();
          if (verb === 'EHLO' || verb === 'HELO') {
            socket.write('250-test\r\n250 SIZE\r\n');
          } else if (verb === 'DATA') {
            inData = true;
            socket.write('354 go\r\n');
          } else if (verb === 'QUIT') {
            socket.write('221 bye\r\n');
            socket.end();
          } else {
            socket.write('250 ok\r\n');
          }
        }
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('no port'));
        return;
      }
      send(addr.port)
        .then(() => {
          server.close(() => resolve(received.join('')));
        })
        .catch(reject);
    });
  });
}

describe('sendSmtpMail', () => {
  it('writes MAIL FROM without embedding an OTP JSON field', async () => {
    const blob = await captureSmtp((port) =>
      sendSmtpMail(
        {
          from: 'auth@community.local',
          to: 'member@example.com',
          subject: 'Seu código',
          text: 'Código: 123456',
        },
        { host: '127.0.0.1', port, secure: 'none', user: '', pass: '' }
      )
    );
    expect(blob).toContain('MAIL FROM:<auth@community.local>');
    expect(blob).not.toContain('dev_otp');
  });

  it('adds reply-to for contact without changing mail from', async () => {
    const blob = await captureSmtp((port) =>
      sendSmtpMail(
        {
          from: 'Community <ops@example.com>',
          to: 'member@example.com',
          replyTo: 'Ada <ada@example.com>',
          subject: 'Contato',
          text: 'oi',
        },
        { host: '127.0.0.1', port, secure: 'none', user: '', pass: '' }
      )
    );
    expect(blob).toContain('MAIL FROM:<ops@example.com>');
    expect(blob).toMatch(/Reply-To:.*Ada <ada@example.com>/i);
  });

  it('refuses to send when smtp is not configured', async () => {
    await expect(
      sendSmtpMail(
        {
          from: 'ops@example.com',
          to: 'member@example.com',
          subject: 'x',
          text: 'x',
        },
        null
      )
    ).rejects.toThrow('SMTP_NOT_CONFIGURED');
  });
});

describe('formatReplyToHeader', () => {
  it('builds a reply-to from name and email', () => {
    expect(formatReplyToHeader('Ada', 'ada@example.com')).toBe('Ada <ada@example.com>');
  });

  it('rejects header injection', () => {
    expect(formatReplyToHeader('Ada\nBcc: evil@x.com', 'ada@example.com')).toBe('ada@example.com');
    expect(formatReplyToHeader('Ada', 'ada@example.com\nBcc: x')).toBeUndefined();
  });
});
