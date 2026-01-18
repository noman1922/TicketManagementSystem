using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;

namespace TicketManagementSystemMongo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]   // Base route: /api/events
    public class EventsController : ControllerBase
    {
        private readonly MongoDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public EventsController(MongoDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: /api/events
        [HttpGet]
        public IActionResult GetEvents()
        {
            var events = _context.Events.Find(_ => true).ToList();
            return Ok(events);
        }

        // GET: /api/events/{id}
        [HttpGet("{id}")]
        public IActionResult GetEvent(string id)
        {
            var ev = _context.Events.Find(e => e.Id == id).FirstOrDefault();
            if (ev == null) return NotFound();
            return Ok(ev);
        }

        // POST: /api/events (Multipart/Form-Data)
        [HttpPost]
        public IActionResult CreateEvent([FromForm] CreateEventRequest request)
        {
            // 1. Handle Image Upload
            string? imageUrl = null;
            if (request.Image != null)
            {
                // Ensure wwwroot/images/events exists
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "images", "events");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + request.Image.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    request.Image.CopyTo(fileStream);
                }

                // Relative path for frontend
                imageUrl = $"/images/events/{uniqueFileName}";
            }

            // 2. Create Event
            var ev = new Event
            {
                Name = request.Name,
                Date = request.Date,
                Location = request.Location,
                Venue = request.Location, // Default Venue to Location if not provided
                Description = request.Description,
                About = request.About,
                Policies = request.Policies,
                Organizer = request.Organizer,
                ImageUrl = imageUrl // Store path
            };

            _context.Events.InsertOne(ev);

            // 3. Create Ticket Types
            if (!string.IsNullOrEmpty(request.TicketTypesJson))
            {
                try
                {
                    var ticketTypes = System.Text.Json.JsonSerializer.Deserialize<List<TicketTypeRequest>>(request.TicketTypesJson);
                    
                    if (ticketTypes != null)
                    {
                        foreach (var tt in ticketTypes)
                        {
                            var newTicketType = new TicketType
                            {
                                EventId = ev.Id,
                                Name = tt.Name,
                                Price = tt.Price,
                                AvailableQuantity = tt.Quantity
                            };
                            _context.TicketTypes.InsertOne(newTicketType);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error parsing TicketTypes: " + ex.Message);
                }
            }

            return CreatedAtAction(nameof(GetEvent), new { id = ev.Id }, ev);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateEvent(string id, [FromForm] CreateEventRequest request)
        {
            var existingEvent = _context.Events.Find(e => e.Id == id).FirstOrDefault();
            if (existingEvent == null) return NotFound();

            // 1. Handle Image Upload (if new image provided)
            string? imageUrl = existingEvent.ImageUrl; // Keep existing image by default
            if (request.Image != null)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "images", "events");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + request.Image.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    request.Image.CopyTo(fileStream);
                }

                imageUrl = $"/images/events/{uniqueFileName}";
            }

            // 2. Update Event
            existingEvent.Name = request.Name;
            existingEvent.Date = request.Date;
            existingEvent.Location = request.Location;
            existingEvent.Venue = request.Location;
            existingEvent.Description = request.Description;
            existingEvent.About = request.About;
            existingEvent.Policies = request.Policies;
            existingEvent.Organizer = request.Organizer;
            existingEvent.ImageUrl = imageUrl;

            _context.Events.ReplaceOne(e => e.Id == id, existingEvent);

            // 3. Update Ticket Types (delete old, create new)
            if (!string.IsNullOrEmpty(request.TicketTypesJson))
            {
                try
                {
                    // Delete existing ticket types for this event
                    _context.TicketTypes.DeleteMany(t => t.EventId == id);

                    // Create new ticket types
                    var ticketTypes = System.Text.Json.JsonSerializer.Deserialize<List<TicketTypeRequest>>(request.TicketTypesJson);
                    
                    if (ticketTypes != null)
                    {
                        foreach (var tt in ticketTypes)
                        {
                            var newTicketType = new TicketType
                            {
                                EventId = id,
                                Name = tt.Name,
                                Price = tt.Price,
                                AvailableQuantity = tt.Quantity
                            };
                            _context.TicketTypes.InsertOne(newTicketType);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error updating TicketTypes: " + ex.Message);
                }
            }

            return Ok(existingEvent);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteEvent(string id)
        {
            var result = _context.Events.DeleteOne(e => e.Id == id);
            if (result.DeletedCount == 0) return NotFound();
            return NoContent();
        }
    }

    public class CreateEventRequest
    {
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Location { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? About { get; set; }
        public string? Policies { get; set; }
        public string? Organizer { get; set; }
        public IFormFile? Image { get; set; }
        public string? TicketTypesJson { get; set; } // JSON string of types
    }

    public class TicketTypeRequest
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}
