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
        string m3uFilePath = @"C:\Projects\tvchanels\Greekstreamtv.m3u"; 
        string outputJsPath = @"C:\Projects\tvchanels\src\data\channels.js";

        if (!File.Exists(m3uFilePath))
        {
            Console.WriteLine("Το αρχείο M3U δεν βρέθηκε!");
            return;
        }

        var channelsList = new List<RawChannel>();
        string[] lines = File.ReadAllLines(m3uFilePath);

        for (int i = 0; i < lines.Length; i++)
        {
            string line = lines[i].Trim();

            if (line.StartsWith("#EXTINF:"))
            {
                string infoLine = line;
                string urlLine = (i + 1 < lines.Length) ? lines[i + 1].Trim() : "";

                if (!string.IsNullOrEmpty(urlLine) && !urlLine.StartsWith("#"))
                {
                    // Εξαγωγή του ονόματος του καναλιού (μετά το τελευταίο κόμμα)
                    string name = infoLine.Split(',').Last().Trim().ToUpper();

                    // 🔥 ΣΤΟΧΕΥΜΕΝΗ ΔΙΟΡΘΩΣΗ ΜΕ ΒΑΣΗ ΤΟ ΟΝΟΜΑ ΚΑΙ ΟΧΙ ΤΟ URL
                    if (name.Contains("ERT1") || name.Contains("ΕΡΤ 1")) 
                        urlLine = @"https://siliconweb.com";
                    else if (name.Contains("ERT2") || name.Contains("ΕΡΤ 2")) 
                        urlLine = "https://siliconweb.com";
                    else if (name.Contains("ERT3") || name.Contains("ΕΡΤ 3")) 
                        urlLine = "https://siliconweb.com";
                    else if (name.Contains("NEWS")) 
                        urlLine = "https://siliconweb.com";
                    else if (name.Contains("SPORTS") || name.Contains("ΣΠΟΡΤ")) 
                        urlLine = "https://siliconweb.com";
                    else if (name.Contains("STAR")) 
                        urlLine = "https://star.gr";
                    else if (name.Contains("OPEN")) 
                        urlLine = "https://netmax.gr";
                    else if (name.Contains("MAD"))
                        urlLine = "https://netmax.gr";
                    else if (name.Contains("WORLD"))
                        urlLine = "https://siliconweb.com";

                    var groupMatch = Regex.Match(infoLine, @"group-title=""([^""]+)""");
                    string region = groupMatch.Success ? groupMatch.Groups[1].Value : "ΔΙΑΦΟΡΑ";
                    string displayName = infoLine.Split(',').Last().Trim();

                    channelsList.Add(new RawChannel { Name = displayName, Url = urlLine, Region = region });
                }
            }
        }

        var groupedChannels = channelsList
            .GroupBy(c => c.Region)
            .Select(g => new ChannelGroup {
                region = g.Key,
                channels = g.Select(c => new Channel { name = c.Name, url = c.Url }).ToList()
            }).ToList();

        string jsonOutput = JsonConvert.SerializeObject(groupedChannels, Formatting.Indented);
        string finalJsContent = $"/* Αυτόματο αρχείο δεδομένων από M3U Converter */\nwindow.CHANNEL_GROUPS = {jsonOutput};";

        File.WriteAllText(outputJsPath, finalJsContent);
        Console.WriteLine($"Επιτυχής ενημέρωση! Μετατράπηκαν {channelsList.Count} κανάλια σε {groupedChannels.Count} κατηγορίες.");
    }
}

class RawChannel { public string Name { get; set; } public string Url { get; set; } public string Region { get; set; } }
class ChannelGroup { public string region { get; set; } public List<Channel> channels { get; set; } }
class Channel { public string name { get; set; } public string url { get; set; } }
