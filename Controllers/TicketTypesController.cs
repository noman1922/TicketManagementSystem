using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;

namespace TicketManagementSystemMongo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]   // Base route: /api/tickettypes
    public class TicketTypesController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public TicketTypesController(MongoDbContext context)
        {
            _context = context;
        }

        // GET: /api/tickettypes
        [HttpGet]
        public IActionResult GetTicketTypes()
        {
            var ticketTypes = _context.TicketTypes.Find(_ => true).ToList();
            return Ok(ticketTypes);
        }

        // GET: /api/tickettypes/{id}
        [HttpGet("{id}")]
        public IActionResult GetTicketType(string id)
        {
            var ticketType = _context.TicketTypes.Find(t => t.TicketTypeId == id).FirstOrDefault();
            if (ticketType == null) return NotFound();
            return Ok(ticketType);
        }

        // POST: /api/tickettypes
        [HttpPost]
        public IActionResult CreateTicketType([FromBody] TicketType ticketType)
        {
            ticketType.TicketTypeId = Guid.NewGuid().ToString();   // generate GUID string
            _context.TicketTypes.InsertOne(ticketType);
            return CreatedAtAction(nameof(GetTicketType), new { id = ticketType.TicketTypeId }, ticketType);
        }

        // DELETE: /api/tickettypes/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteTicketType(string id)
        {
            var result = _context.TicketTypes.DeleteOne(t => t.TicketTypeId == id);
            if (result.DeletedCount == 0) return NotFound();
            return NoContent();
        }
    }
}

