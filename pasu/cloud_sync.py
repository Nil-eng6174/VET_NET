from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive
import os

def authenticate_gdrive():
    """Authenticate using Google Drive API and save credentials to avoid logging in every time."""
    gauth = GoogleAuth()
    
    # Try to load saved client credentials
    gauth.LoadCredentialsFile("mycreds.txt")
    if gauth.credentials is None:
        # Authenticate if they're not there (opens browser)
        gauth.LocalWebserverAuth()
    elif gauth.access_token_expired:
        # Refresh them if expired
        gauth.Refresh()
    else:
        # Initialize the saved creds
        gauth.Authorize()
        
    # Save the current credentials to a file
    gauth.SaveCredentialsFile("mycreds.txt")
    return GoogleDrive(gauth)

def upload_to_gdrive(drive, file_path):
    """Upload a file to Google Drive."""
    try:
        filename = os.path.basename(file_path)
        
        # Check if file already exists on drive to overwrite it instead of creating duplicates
        file_list = drive.ListFile({'q': f"title='{filename}' and trashed=false"}).GetList()
        if file_list:
            # Overwrite existing file
            file_drive = file_list[0]
            print(f"Found existing {filename} on Drive, overwriting...")
        else:
            # Create new file
            file_drive = drive.CreateFile({'title': filename})
            print(f"Creating new {filename} on Drive...")
            
        file_drive.SetContentFile(file_path)
        file_drive.Upload()
        print(f"Success! {filename} is backed up to Google Drive.")
    except Exception as e:
        print(f"Error uploading {file_path}: {e}")

def backup_data():
    if not os.path.exists("client_secrets.json"):
        print("=====================================================")
        print("ERROR: client_secrets.json not found!")
        print("To use Google Drive, you must:")
        print("1. Go to Google Cloud Console (console.cloud.google.com)")
        print("2. Enable the 'Google Drive API'")
        print("3. Create 'OAuth client ID' credentials (Desktop App)")
        print("4. Download the JSON file and rename it to 'client_secrets.json'")
        print("5. Place it in this folder.")
        print("=====================================================")
        return

    print("Authenticating with Google Drive...")
    drive = authenticate_gdrive()
    
    # 1. Upload Excel File
    if os.path.exists("farmer_data.xlsx"):
        upload_to_gdrive(drive, "farmer_data.xlsx")
    else:
        print("farmer_data.xlsx not found locally.")

if __name__ == "__main__":
    print("Starting Google Drive Backup...")
    backup_data()
