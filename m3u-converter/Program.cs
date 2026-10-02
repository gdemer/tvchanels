using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

class Program
{
    static void Main(string[] args)
    {
        // 1. Ορισμός διαδρομών (Άλλαξε τις διαδρομές με τις δικές σου)
        string m3uFilePath = @"C:\Projects\tvchanels\Greekstreamtv.m3u"; 
        string outputJsPath = @"C:\Projects\tvchanels\src\data\channels.js";

        if (!File.Exists(m3uFilePath))
        {
            Console.WriteLine("Το αρχείο M3U δεν βρέθηκε!");
            return;
        }

        var channelsList = new List<RawChannel>();
        string[] lines = File.ReadAllLines(m3uFilePath);

        // 2. Parsing του M3U αρχείου
        for (int i = 0; i < lines.Length; i++)
        {
            string line = lines[i].Trim();

            // Ψάχνουμε τις γραμμές που ξεκινούν με #EXTINF
            if (line.StartsWith("#EXTINF:"))
            {
                string infoLine = line;
                string urlLine = (i + 1 < lines.Length) ? lines[i + 1].Trim() : "";

                if (!string.IsNullOrEmpty(urlLine) && !urlLine.StartsWith("#"))
                {
                    // Regex για την εξαγωγή του group-title (Κατηγορία)
                    var groupMatch = Regex.Match(infoLine, @"group-title=""([^""]+)""");
                    string region = groupMatch.Success ? groupMatch.Groups[1].Value : "ΔΙΑΦΟΡΑ";

                    // Το όνομα του καναλιού βρίσκεται πάντα μετά το τελευταίο κόμμα της γραμμής
                    string name = infoLine.Split(',').Last().Trim();

                    channelsList.Add(new RawChannel
                    {
                        Name = name,
                        Url = urlLine,
                        Region = region
                    });
                }
            }
        }

        // 3. Ομαδοποίηση ανά Κατηγορία/Περιοχή (Region)
        var groupedChannels = channelsList
            .GroupBy(c => c.Region)
            .Select(g => new ChannelGroup
            {
                region = g.Key,
                channels = g.Select(c => new Channel { name = c.Name, url = c.Url }).ToList()
            })
            .ToList();

        // 4. Μετατροπή σε μορφή JavaScript Global Variable
        string jsonOutput = JsonConvert.SerializeObject(groupedChannels, Formatting.Indented);
        string finalJsContent = $"/* Αυτόματο αρχείο δεδομένων από M3U Converter */\nwindow.CHANNEL_GROUPS = {jsonOutput};";

        // 5. Αποθήκευση στο project
        File.WriteAllText(outputJsPath, finalJsContent);

        Console.WriteLine($"Επιτυχής ενημέρωση! Το αρχείο δημιουργήθηκε στο: {outputJsPath}");
    }
}

// Βοηθητικές κλάσεις για το JSON structure
class RawChannel
{
    public string Name { get; set; }
    public string Url { get; set; }
    public string Region { get; set; }
}

class ChannelGroup
{
    public string region { get; set; }
    public List<Channel> channels { get; set; }
}

class Channel
{
    public string name { get; set; }
    public string url { get; set; }
}
