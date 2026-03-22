using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models;

public class Notification
{
    public int Id { get; set; }
    
    public int? SenderId { get; set; }
    
    [JsonIgnore]
    public User? Sender { get; set; }
    
    public int? RecipientId { get; set; }
    
    [JsonIgnore]
    public User? Recipient { get; set; }

    [Required]
    public string Message { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public bool IsRead { get; set; } = false;

    // Denormalized for easy display
    public string SenderEmail { get; set; } = string.Empty;
    public string RecipientEmail { get; set; } = string.Empty;
}
