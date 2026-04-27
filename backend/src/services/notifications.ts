export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailAdapter {
  send(message: EmailMessage): Promise<void>;
}

/**
 * Console email adapter - logs emails to console (for development)
 */
export class ConsoleEmailAdapter implements EmailAdapter {
  async send(message: EmailMessage): Promise<void> {
    console.log('\n📧 Email would be sent:');
    console.log('To:', message.to);
    console.log('Subject:', message.subject);
    console.log('Body (text):', message.text || message.html);
    console.log('---\n');
  }
}

/**
 * SMTP email adapter - sends real emails via SMTP
 * Example implementation structure for future use with nodemailer or SendGrid
 */
export class SmtpEmailAdapter implements EmailAdapter {
  private config: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };

  constructor(config: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  }) {
    this.config = config;
  }

  async send(message: EmailMessage): Promise<void> {
    // TODO: Implement with nodemailer or SendGrid
    // Example:
    // const transporter = nodemailer.createTransport({
    //   host: this.config.host,
    //   port: this.config.port,
    //   auth: {
    //     user: this.config.user,
    //     pass: this.config.password,
    //   },
    // });
    //
    // await transporter.sendMail({
    //   from: this.config.from,
    //   to: message.to,
    //   subject: message.subject,
    //   html: message.html,
    //   text: message.text,
    // });

    console.log('SMTP email sending not yet implemented');
    console.log('SMTP host:', this.config.host);
    console.log('From:', this.config.from);
    console.log('Would send to:', message.to);
  }
}

/**
 * Factory to create the appropriate email adapter based on config
 */
export function createEmailAdapter(): EmailAdapter {
  const adapterType = process.env.EMAIL_ADAPTER || 'console';

  if (adapterType === 'smtp') {
    return new SmtpEmailAdapter({
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      from: process.env.EMAIL_FROM || 'noreply@example.com',
    });
  }

  return new ConsoleEmailAdapter();
}

/**
 * Email notification service
 */
export class NotificationService {
  private emailAdapter: EmailAdapter;

  constructor(emailAdapter?: EmailAdapter) {
    this.emailAdapter = emailAdapter || createEmailAdapter();
  }

  async sendTaskReminder(userEmail: string, taskTitle: string, date: string): Promise<void> {
    await this.emailAdapter.send({
      to: userEmail,
      subject: `Reminder: ${taskTitle}`,
      html: `
        <h2>Task Reminder</h2>
        <p>Don't forget about your task:</p>
        <p><strong>${taskTitle}</strong></p>
        <p>Date: ${date}</p>
        <p>Stay on track with your goals!</p>
      `,
      text: `Task Reminder\n\nDon't forget about your task: ${taskTitle}\nDate: ${date}\n\nStay on track with your goals!`,
    });
  }

  async sendDailySummary(
    userEmail: string,
    date: string,
    tasks: Array<{ title: string; completed: boolean }>
  ): Promise<void> {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;

    await this.emailAdapter.send({
      to: userEmail,
      subject: `Daily Summary - ${date}`,
      html: `
        <h2>Daily Summary</h2>
        <p>Date: ${date}</p>
        <p>Progress: ${completedTasks}/${totalTasks} tasks completed</p>
        <h3>Tasks:</h3>
        <ul>
          ${tasks.map((task) => `<li>${task.completed ? '✓' : '○'} ${task.title}</li>`).join('')}
        </ul>
      `,
      text: `Daily Summary\n\nDate: ${date}\nProgress: ${completedTasks}/${totalTasks} tasks completed\n\nTasks:\n${tasks
        .map((task) => `${task.completed ? '✓' : '○'} ${task.title}`)
        .join('\n')}`,
    });
  }
}
