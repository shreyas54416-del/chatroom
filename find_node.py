import os
import subprocess

def find_file(filename, search_path):
    for root, dirs, files in os.walk(search_path):
        if filename in files:
            return os.path.join(root, filename)
    return None

paths_to_check = [
    os.environ.get('ProgramFiles', 'C:\\Program Files'),
    os.environ.get('ProgramFiles(x86)', 'C:\\Program Files (x86)'),
    os.path.expanduser('~\\AppData\\Local'),
    os.path.expanduser('~\\AppData\\Roaming'),
]

print("Searching for node.exe and npm.cmd...")

node_path = None
npm_path = None

for path in paths_to_check:
    print(f"Checking {path}...")
    if not node_path:
        node_path = find_file('node.exe', path)
    if not npm_path:
        npm_path = find_file('npm.cmd', path)
    
    if node_path and npm_path:
        break

print(f"Node: {node_path}")
print(f"NPM: {npm_path}")

if node_path:
    print("Node version:")
    try:
        res = subprocess.run([node_path, '-v'], capture_output=True, text=True)
        print(res.stdout.strip())
    except Exception as e:
        print(f"Error: {e}")

if npm_path:
    print("NPM version:")
    try:
        res = subprocess.run([npm_path, '-v'], capture_output=True, text=True)
        print(res.stdout.strip())
    except Exception as e:
        print(f"Error: {e}")
