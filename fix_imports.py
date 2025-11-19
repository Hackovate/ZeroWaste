import os
import re
import sys

root_dir = 'src'
print(f"Scanning {root_dir}...")

# Regex to match: from "package@version"
# We handle both single and double quotes.
# We look for @digit.digit.digit at the end of the string inside quotes.
pattern = re.compile(r'from (["\'])(.*?)@\d+\.\d+\.\d+\1')

count = 0
for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(subdir, file)
            # print(f"Checking {filepath}")
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                def replacer(match):
                    quote = match.group(1)
                    pkg = match.group(2)
                    # print(f"Found match: {pkg}")
                    return f'from {quote}{pkg}{quote}'

                new_content = pattern.sub(replacer, content)
                
                if content != new_content:
                    print(f"Fixing {filepath}")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += 1
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print(f"Finished. Fixed {count} files.")
