from query_data import query_rag
import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from populate_database import load_documents, split_documents, add_to_chroma, DATA_PATH
import threading
from queue import Queue
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Queue for handling file changes
file_change_queue = Queue()

class PDFHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.lower().endswith('.pdf'):
            logger.info(f"New PDF detected: {event.src_path}")
            file_change_queue.put(("created", event.src_path))

    def on_modified(self, event):
        if not event.is_directory and event.src_path.lower().endswith('.pdf'):
            logger.info(f"PDF modified: {event.src_path}")
            file_change_queue.put(("modified", event.src_path))

    def on_deleted(self, event):
        if not event.is_directory and event.src_path.lower().endswith('.pdf'):
            logger.info(f"PDF deleted: {event.src_path}")
            file_change_queue.put(("deleted", event.src_path))

def process_file_changes():
    """Process any pending file changes in the queue"""
    while True:
        try:
            if not file_change_queue.empty():
                change_type, file_path = file_change_queue.get()
                logger.info(f"Processing {change_type} for {file_path}")
                
                # Wait a brief moment to ensure file operations are complete
                time.sleep(1)
                
                # Update database
                documents = load_documents()
                chunks = split_documents(documents)
                add_to_chroma(chunks)
                
                logger.info("Database update complete")
            time.sleep(1)  # Small delay to prevent excessive CPU usage
        except Exception as e:
            logger.error(f"Error processing file changes: {str(e)}")

def setup_file_watcher():
    """Set up the file system watcher for the data directory"""
    # Create data directory if it doesn't exist
    if not os.path.exists(DATA_PATH):
        os.makedirs(DATA_PATH)
        logger.info(f"Created {DATA_PATH} directory")

    # Set up the file watcher
    event_handler = PDFHandler()
    observer = Observer()
    observer.schedule(event_handler, DATA_PATH, recursive=False)
    observer.start()
    logger.info(f"Started watching {DATA_PATH} for changes")

    # Start the file processing thread
    process_thread = threading.Thread(target=process_file_changes, daemon=True)
    process_thread.start()
    
    return observer

def ask_question():
    print("\n Real-time Query Assistant")
    print("-" * 50)
    print("\nSystem is ready! The database will automatically update when PDFs are added or modified.")
    print("You can start asking questions. Type 'quit', 'exit', or 'q' to end the session.")
    
    while True:
        try:
            # Get user input
            question = input("\nQuestion: ").strip()
            
            # Check for exit command
            if question.lower() in ['quit', 'exit', 'q']:
                print("\nSession Ended")
                break
                
            if not question:
                print("Please ask a question!")
                continue
                
            # Get and print response
            print("\n Thinking...")
            response = query_rag(question)
            print("\n Answer:", response)
                
        except Exception as e:
            print(f"\nError: Something went wrong - {str(e)}")

if __name__ == "__main__":
    try:
        # Initial database population
        documents = load_documents()
        chunks = split_documents(documents)
        add_to_chroma(chunks)
        
        # Set up the file watcher
        observer = setup_file_watcher()
        
        # Start the question-answering loop
        ask_question()
        
        # Clean shutdown
        observer.stop()
        observer.join()
        
    except KeyboardInterrupt:
        print("\nShutting down...")
        try:
            observer.stop()
            observer.join()
        except:
            pass