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

        // GET: /api/events/{id}
        [HttpGet("{id}")]
        public IActionResult GetEvent(string id)
        {
            var ev = _context.Events.Find(e => e.EventId == id).FirstOrDefault();
            if (ev == null) return NotFound();
            return Ok(ev);
        }

        // POST: /api/events
        [HttpPost]
        public IActionResult CreateEvent([FromBody] Event ev)
        {
            ev.EventId = Guid.NewGuid().ToString();   // generate GUID string
            _context.Events.InsertOne(ev);
            return CreatedAtAction(nameof(GetEvent), new { id = ev.EventId }, ev);
        }

        // DELETE: /api/events/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteEvent(string id)
        {
            var result = _context.Events.DeleteOne(e => e.EventId == id);
            if (result.DeletedCount == 0) return NotFound();
            return NoContent();
        }
    }
}
