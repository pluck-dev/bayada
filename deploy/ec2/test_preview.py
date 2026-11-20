import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec=importlib.util.spec_from_file_location('preview',Path(__file__).with_name('deploy-korea-preview.py'))
preview=importlib.util.module_from_spec(spec);spec.loader.exec_module(preview)
class PreviewSafety(unittest.TestCase):
 def test_identity_is_stable_but_branches_do_not_share_database(self):
  first=preview.identity('feat/renewal','a'*40,'renewal.korea.54-116-157-4.sslip.io')
  self.assertEqual(first,preview.identity('feat/renewal','b'*40,'renewal.korea.54-116-157-4.sslip.io'))
  self.assertNotEqual(first,preview.identity('feat-renewal','a'*40,'other.korea.54-116-157-4.sslip.io'))
 def test_host_cannot_target_production_or_inject_configuration(self):
  for host in ['korea.54-116-157-4.sslip.io','evil.example','a.korea.54-116-157-4.sslip.io\nhandle / {respond 200}','../../app']:
   with self.assertRaises(ValueError):preview.identity('feat/renewal','a'*40,host)
 def test_commit_and_branch_are_bounded(self):
  with self.assertRaises(ValueError):preview.identity('x','main','renewal.korea.54-116-157-4.sslip.io')
  with self.assertRaises(ValueError):preview.identity('x\nreload','a'*40,'renewal.korea.54-116-157-4.sslip.io')
 def test_sql_literal_preserves_quotes_and_rejects_null(self):
  self.assertEqual(preview.literal("a';DROP DATABASE bayada;--"),"'a'';DROP DATABASE bayada;--'")
  with self.assertRaises(ValueError):preview.literal('\x00')
 def test_only_public_board_fixture_namespaces_are_seeded(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);folder=root/'packages/korea/content';folder.mkdir(parents=True)
   post={'id':'1','board':'bayadab_01','title':"title's",'content':'<p>Public</p>'}
   file=folder/'boards.json';file.write_text(json.dumps([post]));statement,count=preview.fixture_sql(root)
   self.assertEqual(count,1);self.assertIn('korea/post/bayadab_01/1',statement);self.assertIn("title''s",statement)
   post['board']='korea/inquiry/private';file.write_text(json.dumps([post]))
   with self.assertRaises(ValueError):preview.fixture_sql(root)
if __name__=='__main__':unittest.main()
