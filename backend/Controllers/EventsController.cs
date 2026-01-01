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

        public EventsController(MongoDbContext context)
        {
            _context = context;
        }

        // GET: /api/events
        [HttpGet]
        public IActionResult GetEvents()
        {
            var events = _context.Events.Find(_ => true).ToList();
            return Ok(events);   // ✅ returns JSON
        }

        // Change all EventId references to Id:
[HttpGet("{id}")]
public IActionResult GetEvent(string id)
{
    var ev = _context.Events.Find(e => e.Id == id).FirstOrDefault(); // Changed
    if (ev == null) return NotFound();
    return Ok(ev);
}

[HttpPost]
public IActionResult CreateEvent([FromBody] Event ev)
{
    // REMOVE: ev.EventId = Guid.NewGuid().ToString();
    _context.Events.InsertOne(ev);
    return CreatedAtAction(nameof(GetEvent), new { id = ev.Id }, ev); // Changed
}

[HttpDelete("{id}")]
public IActionResult DeleteEvent(string id)
{
    var result = _context.Events.DeleteOne(e => e.Id == id); // Changed
    if (result.DeletedCount == 0) return NotFound();
    return NoContent();
}
    }
}
