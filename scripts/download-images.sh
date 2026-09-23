#!/usr/bin/env bash
# One-off script used to fetch the Movin' editorial image set from Unsplash into public/images.
# Safe to re-run; re-downloads are idempotent (same filenames, overwritten).
set -u
cd "$(dirname "$0")/.."

fetch() {
  local out="$1" id="$2" w="$3" q="$4"
  curl -sL "https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&fm=webp&fit=crop&auto=format" -o "$out"
}

# Hero + default fallback
fetch public/images/hero.webp 1768423083309-92973c2fb5e5 1920 75 &
fetch public/images/default-trip.webp 1784296113695-2d24ef33e939 1000 72 &
wait

# Destination cards (Landing page)
fetch public/images/destinations/sicily.webp    1688105688639-c7469524e569 1000 78 &
fetch public/images/destinations/paris.webp     1757435755336-f715ff8896d8 1000 78 &
fetch public/images/destinations/barcelona.webp 1636738456135-7b46f1f32a21 1000 78 &
fetch public/images/destinations/santorini.webp 1548580392-8d9c772d854e   1000 78 &
fetch public/images/destinations/rome.webp      1561035633-09a23e7c0b23   1000 78 &
fetch public/images/destinations/london.webp    1707308026406-847135f003cc 1000 78 &
wait

# Places (external_id -> unsplash photo id), grouped in small parallel batches
fetch public/images/places/sicily-hotel-1.webp 1782177260384-236009cac217 1000 72 &
fetch public/images/places/sicily-hotel-2.webp 1773370526423-c76f5057d285 1000 72 &
fetch public/images/places/sicily-rest-1.webp  1785734076489-58eec8cfc7ce 1000 72 &
fetch public/images/places/sicily-rest-2.webp  1778312970027-4a9f36d337f3 1000 72 &
fetch public/images/places/sicily-attr-1.webp  1727951234567-a72b4ea09c82 1000 72 &
fetch public/images/places/sicily-attr-2.webp  1688105475036-a7bfe3d77bc1 1000 72 &
fetch public/images/places/sicily-attr-3.webp  1727951234643-02b9016c5ce6 1000 72 &
fetch public/images/places/sicily-attr-4.webp  1688105573068-ecb30cc98c0a 1000 72 &
wait

fetch public/images/places/sicily-cafe-1.webp  1570961367137-842624168f04 1000 72 &
fetch public/images/places/sicily-cafe-2.webp  1559585648-e8d818cfca89   1000 72 &
fetch public/images/places/sicily-beach-1.webp 1704830657561-a6a663931172 1000 72 &
fetch public/images/places/sicily-beach-2.webp 1461937995729-a2e442122d18 1000 72 &
fetch public/images/places/paris-attr-1.webp   1563813433958-b953126a9c43 1000 72 &
fetch public/images/places/paris-attr-2.webp   1775211474605-e4fef9d8baf4 1000 72 &
fetch public/images/places/paris-attr-3.webp   1775320719068-e6ad34f07659 1000 72 &
fetch public/images/places/paris-rest-1.webp   1775485192677-0e6dd6fb732c 1000 72 &
wait

fetch public/images/places/paris-cafe-1.webp   1761116180950-a180375f3b63 1000 72 &
fetch public/images/places/paris-hotel-1.webp  1759431772531-d1dd586e0a7f 1000 72 &
fetch public/images/places/bcn-attr-1.webp     1701101660719-365767f601df 1000 72 &
fetch public/images/places/bcn-attr-2.webp     1636738457043-514ff5b08b4e 1000 72 &
fetch public/images/places/bcn-attr-3.webp     1636738457489-a5b1b8ad15c6 1000 72 &
fetch public/images/places/bcn-beach-1.webp    1536869338989-e7ffd2297454 1000 72 &
fetch public/images/places/bcn-rest-1.webp     1783633308277-2832f3f5cf7f 1000 72 &
fetch public/images/places/bcn-cafe-1.webp     1718788712222-5893863c4112 1000 72 &
wait

fetch public/images/places/san-attr-1.webp     1632046813055-eaef29c779f8 1000 72 &
fetch public/images/places/san-beach-1.webp    1630247633733-19cb9d498ffb 1000 72 &
fetch public/images/places/san-rest-1.webp     1777097947528-3dac7b9d543e 1000 72 &
fetch public/images/places/san-hotel-1.webp    1781150044266-43feac437caf 1000 72 &
fetch public/images/places/rome-attr-1.webp    1672073885826-1cb207dbc8f3 1000 72 &
fetch public/images/places/rome-attr-2.webp    1672073885763-d8ac8a49302c 1000 72 &
fetch public/images/places/rome-attr-3.webp    1645636648681-c4460c78c8c4 1000 72 &
fetch public/images/places/rome-attr-4.webp    1672073885580-78ce8afab86a 1000 72 &
wait

fetch public/images/places/rome-rest-1.webp    1760995579822-2903adb80476 1000 72 &
fetch public/images/places/rome-cafe-1.webp    1782486750289-08c07c706557 1000 72 &
fetch public/images/places/lon-attr-1.webp     1594648145890-6a0595df62fc 1000 72 &
fetch public/images/places/lon-attr-2.webp     1578793226777-3ce6ec6f911e 1000 72 &
fetch public/images/places/lon-attr-3.webp     1711312694457-3605f27add50 1000 72 &
fetch public/images/places/lon-attr-4.webp     1622572771591-6ca7813cc39d 1000 72 &
fetch public/images/places/lon-rest-1.webp     1559925393-8be0ec4767c8   1000 72 &
fetch public/images/places/lon-cafe-1.webp     1707308029017-1f5ce047706c 1000 72 &
wait

echo "Done. Byte sizes:"
find public/images -type f -name "*.webp" | sort | xargs -I{} sh -c 'printf "%6s  %s\n" "$(wc -c < "{}")" "{}"'
