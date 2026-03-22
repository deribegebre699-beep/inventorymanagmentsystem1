using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace backend.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var smtpHost = _configuration["Email:Host"];
        var smtpPort = int.Parse(_configuration["Email:Port"] ?? "587");
        var smtpUser = _configuration["Email:Username"];
        var smtpPass = _configuration["Email:Password"];
        var fromEmail = _configuration["Email:FromEmail"] ?? smtpUser;
        var senderName = _configuration["Email:SenderName"] ?? "StockPro";

        if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser))
        {
            // Simulated mode: log to console if SMTP not configured
            Console.WriteLine("-----------------------------------");
            Console.WriteLine($"SIMULATED EMAIL TO: {toEmail}");
            Console.WriteLine($"SUBJECT: {subject}");
            Console.WriteLine($"BODY: {body}");
            Console.WriteLine("-----------------------------------");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, fromEmail!));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder { HtmlBody = body };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(smtpUser, smtpPass);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
    public async Task SendEmailWithAttachmentsAsync(string toEmail, string ccEmail, string subject, string body, List<IFormFile> attachments)
    {
        var smtpHost = _configuration["Email:Host"];
        var smtpPort = int.Parse(_configuration["Email:Port"] ?? "587");
        var smtpUser = _configuration["Email:Username"];
        var smtpPass = _configuration["Email:Password"];
        var fromEmail = _configuration["Email:FromEmail"] ?? smtpUser;
        var senderName = _configuration["Email:SenderName"] ?? "StockPro";

        if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser))
        {
            Console.WriteLine("-----------------------------------");
            Console.WriteLine($"SIMULATED EMAIL TO: {toEmail}");
            if (!string.IsNullOrEmpty(ccEmail)) Console.WriteLine($"CC: {ccEmail}");
            Console.WriteLine($"SUBJECT: {subject}");
            Console.WriteLine($"BODY: {body}");
            Console.WriteLine($"ATTACHMENTS: {(attachments != null ? attachments.Count : 0)}");
            Console.WriteLine("-----------------------------------");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, fromEmail!));
        message.To.Add(MailboxAddress.Parse(toEmail));
        
        if (!string.IsNullOrEmpty(ccEmail))
        {
            message.Cc.Add(MailboxAddress.Parse(ccEmail));
        }

        message.Subject = subject;

        var bodyBuilder = new BodyBuilder { HtmlBody = body };

        if (attachments != null && attachments.Count > 0)
        {
            foreach (var file in attachments)
            {
                if (file.Length > 0)
                {
                    using var ms = new MemoryStream();
                    await file.CopyToAsync(ms);
                    bodyBuilder.Attachments.Add(file.FileName, ms.ToArray(), ContentType.Parse(file.ContentType ?? "application/octet-stream"));
                }
            }
        }

        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(smtpUser, smtpPass);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
