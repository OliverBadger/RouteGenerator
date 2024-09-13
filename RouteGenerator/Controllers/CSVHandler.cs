using CsvHelper;
using CsvHelper.Configuration;
using RouteGenerator.Areas.Identity.Data;
using System.Globalization;

namespace RouteGenerator.Controllers
{
    public class CSVHandler
    {
        private readonly string _hotspotFilePath = "Hotspots.csv";
        private readonly string _locationFilePath = "Locations.csv";

        public void SaveHotspotToCsv(Hotspot hotspot, string userEmail)
        {
            // Assign the email to the hotspot's UserEmail field
            hotspot.UserEmail = userEmail;

            using (var writer = new StreamWriter(_hotspotFilePath, append: true))
            using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
            {
                csv.WriteRecord(hotspot);
                writer.WriteLine();
            }
        }

        // Save a Location to CSV
        public void SaveLocationToCsv(Location location)
        {
            using (var writer = new StreamWriter(_locationFilePath, append: true))
            using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
            {
                csv.WriteRecord(location);
                writer.WriteLine();
            }
        }

        // Read Hotspots from CSV
        public IEnumerable<Hotspot> ReadHotspotsFromCsv()
        {
            using (var reader = new StreamReader(_hotspotFilePath))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                return csv.GetRecords<Hotspot>().ToList();
            }
        }

        // Read Locations from CSV
        public IEnumerable<Location> ReadLocationsFromCsv()
        {
            using (var reader = new StreamReader(_locationFilePath))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                return csv.GetRecords<Location>().ToList();
            }
        }
    }

    // CSV Mapping if necessary for customization
    public sealed class HotspotMap : ClassMap<Hotspot>
    {
        public HotspotMap()
        {
            Map(m => m.Id);
            Map(m => m.LocationId);
            Map(m => m.UserEmail);
        }
    }

    public sealed class LocationMap : ClassMap<Location>
    {
        public LocationMap()
        {
            Map(m => m.Id);
            Map(m => m.Latitude);
            Map(m => m.Longitude);
        }
    }
}
