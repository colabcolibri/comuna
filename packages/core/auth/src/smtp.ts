import net from 'net';

function lastReply(buffer: string): { code: number; complete: boolean } | null {
  const lines = buffer.split(/\r?\n/).filter((line) => line.length > 0);
  if (!lines.length) {
    return null;
  }
  const last = lines[lines.length - 1];
  const match = last.match(/^(\d{3})([\s-])/);
  if (!match) {
    return null;
  }
  return { code: Number(match[1]), complete: match[2] === ' ' };
}

export async function sendSmtpMail(opts: {
  host: string;
  port: number;
  from: string;
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const { host, port, from, to, subject, text } = opts;
  await new Promise<void>((resolve, reject) => {
    const socket = net.connect({ host, port });
    let buffer = '';
    let step = 0;
    const payload = [
      `Subject: ${subject}`,
      `From: ${from}`,
      `To: ${to}`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      text,
      `.`,
    ].join('\r\n');
    const outbound = [
      'EHLO community.local',
      `MAIL FROM:<${from}>`,
      `RCPT TO:<${to}>`,
      'DATA',
      payload,
      'QUIT',
    ];

    const fail = (err: Error) => {
      socket.destroy();
      reject(err);
    };

    const timer = setTimeout(() => fail(new Error('SMTP timeout')), 8000);

    const writeNext = () => {
      if (step >= outbound.length) {
        return;
      }
      socket.write(`${outbound[step++]}\r\n`);
    };

    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      const reply = lastReply(buffer);
      if (!reply?.complete) {
        return;
      }
      buffer = '';
      if (reply.code >= 400) {
        clearTimeout(timer);
        fail(new Error(`SMTP ${reply.code}`));
        return;
      }
      if (reply.code === 221 || step >= outbound.length) {
        clearTimeout(timer);
        socket.end();
        resolve();
        return;
      }
      writeNext();
    });
  });
}
