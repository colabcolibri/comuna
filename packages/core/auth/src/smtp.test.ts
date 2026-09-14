import net from 'net';
import { sendSmtpMail } from './smtp';

describe('sendSmtpMail', () => {
  it('writes MAIL FROM without embedding an OTP JSON field', async () => {
    const received: string[] = [];
    await new Promise<void>((resolve, reject) => {
      const server = net.createServer((socket) => {
        socket.write('220 test\r\n');
        socket.on('data', (chunk) => {
          received.push(chunk.toString());
          if (chunk.toString().includes('QUIT')) {
            socket.end();
            server.close();
            resolve();
          } else {
            socket.write('250 ok\r\n');
          }
        });
      });
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (!addr || typeof addr === 'string') {
          reject(new Error('no port'));
          return;
        }
        sendSmtpMail({
          host: '127.0.0.1',
          port: addr.port,
          from: 'auth@community.local',
          to: 'member@example.com',
          subject: 'Seu código',
          text: 'Código: 123456',
        }).catch(reject);
      });
    });
    const blob = received.join('');
    expect(blob).toContain('MAIL FROM:<auth@community.local>');
    expect(blob).not.toContain('dev_otp');
  });
});
