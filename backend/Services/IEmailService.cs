namespace backend.Services;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body);
    Task SendEmailWithAttachmentsAsync(string toEmail, string ccEmail, string subject, string body, List<IFormFile> attachments);
}
