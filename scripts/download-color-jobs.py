#!/usr/bin/env python3
"""
Download Higgsfield Nano Banana 2 color variant jobs, run through pipeline,
save to img/farben/fenster_1fl_<key>.png
"""

import os, sys, time, subprocess, json
import urllib.request
from PIL import Image
from io import BytesIO

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIPELINE = os.path.join(BASE, 'scripts', 'process-master-image.py')
OUT_DIR  = os.path.join(BASE, 'img', 'farben')
os.makedirs(OUT_DIR, exist_ok=True)

# job_id → color_key(s)  (first key = primary filename, rest = copies)
JOBS = {
    '2e0303c2-1aad-4774-a839-d942fe2cec01': ['anthrazit', 'anthraz-gl', 'anthraz-um'],
    '90f545f1-930a-4c05-b35a-98f8512c8c4d': ['golden-oak'],
    'da9ae812-b4c0-4808-ac3e-5cb32bec6923': ['basaltgr-gl', 'basaltgr-sa'],
    '4695b325-9bf5-41d6-bce0-0fccf3289d38': ['winchester'],
    'f314b578-f392-44e5-a41a-3d7f4ace7156': ['lichtgrau'],
    'ea7c90bf-dcbd-4f3a-b21c-27ee60b2e91d': ['signalgrau'],
    '414bf6dc-3a74-494e-8df5-a05c9b0519b7': ['quarzgr-gl', 'quarzgr-sa'],
    '309df54a-dd6b-46e3-bb98-b3ede06282cf': ['eiche-hell'],
    'd10f5f21-f687-4439-b6b2-a82da1e511d9': ['betongrau'],
    '9f2ff5c3-96a3-4afe-983a-05b8feaad8c9': ['schiefgr-gl', 'schiefgr-sa'],
    '4ca2749e-ce37-45f8-9837-250f03dd034d': ['schwarz-um'],
    'dded79a7-b59e-4dbe-b5d2-4ae4a1ab6db5': ['eiche-nat'],
    '2213d0fc-b37a-4dff-a283-3499e20ac7a9': ['achatgrau'],
    '1e9a85c3-482f-42af-aa56-48ffc1589950': ['nussbaum'],
    'b75c68dc-811f-4e5e-822b-afa86e6146ea': ['dunkelrot'],
    'e3ad5803-be7f-43d1-81f9-0e92935b5b4b': ['stahlblau'],
    '92d918c9-e155-4bd7-a294-f7f0f4273afc': ['moosgruen'],
    '4ff82108-e04f-4f3c-8b09-881096363d55': ['dunkelgr'],
    '42644957-a836-4f10-82ce-337aa57700f0': ['brillblau'],
    '9b069c02-eee9-4a74-991f-7249aacf8321': ['schwarzbr'],
    '545de78c-5d59-48dd-94e8-a27ce6ca8cd0': ['mooreiche'],
    '487cfbb9-6f2f-435b-8048-e422ded6e26a': ['dunkleiche'],
    '8c6fc2e1-2ebf-4f79-9387-9e0e37d96d6f': ['siena-noce'],
    '973d60c2-3577-45b6-a847-5a017a34889c': ['siena-ross'],
    '41c913a4-e34e-4df4-9379-0def7bce8453': ['mahagoni'],
    'f33aa5c4-9eeb-4501-8481-f4073f9296a0': ['macore'],
    '6039aabb-e441-4d46-874e-bae38ded086e': ['schoko-br'],
    '954652ae-c581-420a-99db-850a39a4d071': ['braun-mar'],
    'be7e5331-dc58-4777-81a7-06977ed61cd6': ['oregon'],
    '797f8f96-06e3-4eef-a118-dcb4b12f802c': ['douglasie'],
    'dafb268e-da51-4b20-93a2-d62f2a16b70d': ['bergkiefer'],
    '40158f00-4c8e-40f8-aabe-39230fa3a613': ['teak'],
    'd0338f06-d58d-4664-b88f-5c7a91410f24': ['sheffield'],
    '1eed562e-f97a-44bd-bebf-e4b3696cc379': ['alux-db'],
    '77fe1552-c02d-496b-852c-78927a074110': ['alu-gebr'],
    '0b920cda-63b2-4c63-99af-c080a9998ee8': ['eisengl'],
    '3a6bc25c-898c-4400-9e80-12cd962a1fcf': ['crown-plat'],
    '2a2905b5-5786-4c38-a535-2f34a48f1564': ['cremeweiss'],
    '7369957a-0a8e-48bf-9705-3aaadd6ee5a6': ['weiss-fx'],
}


def poll_job(job_id, timeout=120):
    """Poll Higgsfield job via local MCP (uses curl to check status)."""
    # We don't have direct API access from Python — we'll use the download URL
    # from the job result we already have for the first job.
    # For remaining jobs, we need to construct the URL or poll via API.
    # Since we can't call the MCP from Python, we'll use a simple HTTP check approach.
    # The rawUrl format: https://d8j0ntlcm91z4.cloudfront.net/user_3CzYqMx8y6Fas7xDmvKDIms1Hil/hf_<date>_<jobid>.png
    # We don't know the exact URL without polling the API.
    # Return None — caller will handle via pre-known URLs or by re-running with MCP.
    return None


def download_url(url, timeout=30):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def run_pipeline(input_path, output_path):
    result = subprocess.run(
        [sys.executable, PIPELINE, input_path, output_path],
        capture_output=True, text=True
    )
    return result.returncode == 0


def process_url(url, keys):
    """Download image from URL, run pipeline, save for all keys."""
    primary_key = keys[0]
    primary_out = os.path.join(OUT_DIR, f'fenster_1fl_{primary_key}.png')
    tmp_path = os.path.join(OUT_DIR, f'_tmp_{primary_key}.png')

    try:
        data = download_url(url)
        img = Image.open(BytesIO(data))
        img.save(tmp_path, 'PNG')

        if run_pipeline(tmp_path, primary_out):
            os.remove(tmp_path)
            print(f'  ✓ {primary_key:20s} → {os.path.basename(primary_out)}')

            # Copy for duplicate-hex aliases
            import shutil
            for alias in keys[1:]:
                alias_out = os.path.join(OUT_DIR, f'fenster_1fl_{alias}.png')
                shutil.copy2(primary_out, alias_out)
                print(f'    → copy {alias}')

            return True
        else:
            print(f'  ✗ Pipeline failed for {primary_key}')
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            return False

    except Exception as e:
        print(f'  ✗ Error for {primary_key}: {e}')
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        return False


# Pre-known URLs from job results (all 38 completed jobs)
BASE_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3CzYqMx8y6Fas7xDmvKDIms1Hil/'
KNOWN_URLS = {
    '2e0303c2-1aad-4774-a839-d942fe2cec01': BASE_URL + 'hf_20260501_173740_2e0303c2-1aad-4774-a839-d942fe2cec01.png',
    '90f545f1-930a-4c05-b35a-98f8512c8c4d': BASE_URL + 'hf_20260501_173747_90f545f1-930a-4c05-b35a-98f8512c8c4d.png',
    'da9ae812-b4c0-4808-ac3e-5cb32bec6923': BASE_URL + 'hf_20260501_173757_da9ae812-b4c0-4808-ac3e-5cb32bec6923.png',
    '4695b325-9bf5-41d6-bce0-0fccf3289d38': BASE_URL + 'hf_20260501_173804_4695b325-9bf5-41d6-bce0-0fccf3289d38.png',
    'f314b578-f392-44e5-a41a-3d7f4ace7156': BASE_URL + 'hf_20260501_173810_f314b578-f392-44e5-a41a-3d7f4ace7156.png',
    'ea7c90bf-dcbd-4f3a-b21c-27ee60b2e91d': BASE_URL + 'hf_20260501_173817_ea7c90bf-dcbd-4f3a-b21c-27ee60b2e91d.png',
    '414bf6dc-3a74-494e-8df5-a05c9b0519b7': BASE_URL + 'hf_20260501_173824_414bf6dc-3a74-494e-8df5-a05c9b0519b7.png',
    '309df54a-dd6b-46e3-bb98-b3ede06282cf': BASE_URL + 'hf_20260501_173831_309df54a-dd6b-46e3-bb98-b3ede06282cf.png',
    'd10f5f21-f687-4439-b6b2-a82da1e511d9': BASE_URL + 'hf_20260501_173837_d10f5f21-f687-4439-b6b2-a82da1e511d9.png',
    '9f2ff5c3-96a3-4afe-983a-05b8feaad8c9': BASE_URL + 'hf_20260501_173844_9f2ff5c3-96a3-4afe-983a-05b8feaad8c9.png',
    '4ca2749e-ce37-45f8-9837-250f03dd034d': BASE_URL + 'hf_20260501_173851_4ca2749e-ce37-45f8-9837-250f03dd034d.png',
    'dded79a7-b59e-4dbe-b5d2-4ae4a1ab6db5': BASE_URL + 'hf_20260501_173859_dded79a7-b59e-4dbe-b5d2-4ae4a1ab6db5.png',
    '2213d0fc-b37a-4dff-a283-3499e20ac7a9': BASE_URL + 'hf_20260501_173906_2213d0fc-b37a-4dff-a283-3499e20ac7a9.png',
    '1e9a85c3-482f-42af-aa56-48ffc1589950': BASE_URL + 'hf_20260501_173912_1e9a85c3-482f-42af-aa56-48ffc1589950.png',
    'b75c68dc-811f-4e5e-822b-afa86e6146ea': BASE_URL + 'hf_20260501_173919_b75c68dc-811f-4e5e-822b-afa86e6146ea.png',
    'e3ad5803-be7f-43d1-81f9-0e92935b5b4b': BASE_URL + 'hf_20260501_173927_e3ad5803-be7f-43d1-81f9-0e92935b5b4b.png',
    '92d918c9-e155-4bd7-a294-f7f0f4273afc': BASE_URL + 'hf_20260501_173935_92d918c9-e155-4bd7-a294-f7f0f4273afc.png',
    '4ff82108-e04f-4f3c-8b09-881096363d55': BASE_URL + 'hf_20260501_173942_4ff82108-e04f-4f3c-8b09-881096363d55.png',
    '42644957-a836-4f10-82ce-337aa57700f0': BASE_URL + 'hf_20260501_174001_42644957-a836-4f10-82ce-337aa57700f0.png',
    '9b069c02-eee9-4a74-991f-7249aacf8321': BASE_URL + 'hf_20260501_174008_9b069c02-eee9-4a74-991f-7249aacf8321.png',
    # 545de78c = mooreiche → FAILED, skip
    '487cfbb9-6f2f-435b-8048-e422ded6e26a': BASE_URL + 'hf_20260501_174022_487cfbb9-6f2f-435b-8048-e422ded6e26a.png',
    '8c6fc2e1-2ebf-4f79-9387-9e0e37d96d6f': BASE_URL + 'hf_20260501_174028_8c6fc2e1-2ebf-4f79-9387-9e0e37d96d6f.png',
    '973d60c2-3577-45b6-a847-5a017a34889c': BASE_URL + 'hf_20260501_174036_973d60c2-3577-45b6-a847-5a017a34889c.png',
    '41c913a4-e34e-4df4-9379-0def7bce8453': BASE_URL + 'hf_20260501_174043_41c913a4-e34e-4df4-9379-0def7bce8453.png',
    'f33aa5c4-9eeb-4501-8481-f4073f9296a0': BASE_URL + 'hf_20260501_174049_f33aa5c4-9eeb-4501-8481-f4073f9296a0.png',
    '6039aabb-e441-4d46-874e-bae38ded086e': BASE_URL + 'hf_20260501_174056_6039aabb-e441-4d46-874e-bae38ded086e.png',
    '954652ae-c581-420a-99db-850a39a4d071': BASE_URL + 'hf_20260501_174103_954652ae-c581-420a-99db-850a39a4d071.png',
    'be7e5331-dc58-4777-81a7-06977ed61cd6': BASE_URL + 'hf_20260501_174111_be7e5331-dc58-4777-81a7-06977ed61cd6.png',
    '797f8f96-06e3-4eef-a118-dcb4b12f802c': BASE_URL + 'hf_20260501_174117_797f8f96-06e3-4eef-a118-dcb4b12f802c.png',
    'dafb268e-da51-4b20-93a2-d62f2a16b70d': BASE_URL + 'hf_20260501_174125_dafb268e-da51-4b20-93a2-d62f2a16b70d.png',
    '40158f00-4c8e-40f8-aabe-39230fa3a613': BASE_URL + 'hf_20260501_174132_40158f00-4c8e-40f8-aabe-39230fa3a613.png',
    'd0338f06-d58d-4664-b88f-5c7a91410f24': BASE_URL + 'hf_20260501_174142_d0338f06-d58d-4664-b88f-5c7a91410f24.png',
    '1eed562e-f97a-44bd-bebf-e4b3696cc379': BASE_URL + 'hf_20260501_174149_1eed562e-f97a-44bd-bebf-e4b3696cc379.png',
    '77fe1552-c02d-496b-852c-78927a074110': BASE_URL + 'hf_20260501_174156_77fe1552-c02d-496b-852c-78927a074110.png',
    '0b920cda-63b2-4c63-99af-c080a9998ee8': BASE_URL + 'hf_20260501_174202_0b920cda-63b2-4c63-99af-c080a9998ee8.png',
    '3a6bc25c-898c-4400-9e80-12cd962a1fcf': BASE_URL + 'hf_20260501_174210_3a6bc25c-898c-4400-9e80-12cd962a1fcf.png',
    '2a2905b5-5786-4c38-a535-2f34a48f1564': BASE_URL + 'hf_20260501_174217_2a2905b5-5786-4c38-a535-2f34a48f1564.png',
    '7369957a-0a8e-48bf-9705-3aaadd6ee5a6': BASE_URL + 'hf_20260501_174224_7369957a-0a8e-48bf-9705-3aaadd6ee5a6.png',
}

if __name__ == '__main__':
    # Process any known URLs
    done = 0
    for job_id, url in KNOWN_URLS.items():
        keys = JOBS.get(job_id, [job_id])
        if process_url(url, keys):
            done += 1

    print(f'\nProcessed {done} / {len(KNOWN_URLS)} known URLs')
    print(f'Remaining {len(JOBS) - len(KNOWN_URLS)} jobs need URLs from Higgsfield API')
