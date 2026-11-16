import os
import sys
import unittest

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ingest import load_track_data, parse_nmea_sentence, parse_vbox_coord


class TestNMEAParsing(unittest.TestCase):
    def test_gprmc(self):
        line = "$GPRMC,220516,A,5133.82,N,00042.24,W,173.8,231.8,130694,004.2,W*70"
        result = parse_nmea_sentence(line)
        self.assertIsNotNone(result)
        self.assertEqual(result["class"], "TPV")
        self.assertAlmostEqual(result["lat"], 51.56366666666667, places=5)
        self.assertAlmostEqual(result["lon"], -0.704, places=5)
        self.assertAlmostEqual(result["speed"], 173.8 * 0.514444, places=2)
        self.assertAlmostEqual(result["track"], 231.8, places=2)

    def test_gpgga(self):
        line = "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47"
        result = parse_nmea_sentence(line)
        self.assertIsNotNone(result)
        self.assertEqual(result["class"], "TPV")
        self.assertAlmostEqual(result["lat"], 48.1173, places=4)
        self.assertAlmostEqual(result["lon"], 11.51666, places=4)
        self.assertEqual(result["speed"], 0.0)
        self.assertEqual(result["track"], 0.0)

    def test_invalid(self):
        self.assertIsNone(parse_nmea_sentence("$GPZZZ,INVALID"))

    def test_bad_checksum(self):
        line = "$GPRMC,220516,A,5133.82,N,00042.24,W,173.8,231.8,130694,004.2,W*00"
        self.assertIsNone(parse_nmea_sentence(line))

    def test_vbox_csv_loader(self):
        self.assertAlmostEqual(parse_vbox_coord("38°9.631176 N"), 38.1605196, places=5)
        self.assertAlmostEqual(parse_vbox_coord("122°27.228036 W"), -122.4538006, places=5)
        points = load_track_data("SampleStream2024.csv")
        self.assertGreater(len(points), 11000)


if __name__ == "__main__":
    unittest.main()
