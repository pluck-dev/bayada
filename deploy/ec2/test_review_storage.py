import re
from pathlib import Path
import unittest
from korea_review_storage import ensure_review_storage
class ReviewStorageSafety(unittest.TestCase):
 def test_operational_database_is_rejected_before_commands(self):
  with self.assertRaises(ValueError):ensure_review_storage('bayada',Path('unused'),{})
 def test_schema_contains_only_review_models(self):
  schema=Path(__file__).with_name('review-schema.sql').read_text(encoding='utf-8-sig')
  self.assertEqual(re.findall(r'CREATE TABLE IF NOT EXISTS "([^\"]+)"',schema),['ReviewFeedback','ReviewFeedbackReply'])
  self.assertNotIn('DROP TABLE',schema)
if __name__=='__main__':unittest.main()
