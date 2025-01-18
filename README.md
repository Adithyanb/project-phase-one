# DataHive: A Centralized Platform for Student Data Management

DataHive is a robust and secure application designed to streamline the management of student records within a college environment. It enables faculty and staff to manage data efficiently while providing secure access for students to view their individual records.

## Features
- **Student Data Management**: Centralized storage for academic performance, attendance, and internship details.
- **Secure Access**: Role-based access control for faculty, staff, and students.
- **AI-Driven Insights**: Integration with LLM for personalized responses and insights.
- **Modern UI**: User-friendly interface built with React.js and Vite.

## Prerequisites
- Node.js and npm
- Python 3.8 or higher
- Virtual environment tool (e.g., `venv` or `virtualenv`)
- Required Python libraries (listed in `requirements.txt`)
- Ollama installed (for managing the Llama model)

## Installation and Setup

### Frontend Setup

1. **Clone the Repository**:
   ```bash
   git clone <frontend-repo-url>
   cd <frontend-repo-folder>
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Frontend**:
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Install FastAPI and Dependencies**:
   Install FastAPI and FastAPI CORS:
   ```bash
   pip install fastapi fastapi[all] fastapi-cors
   ```

3. **Install Ollama**:
   Follow the [Ollama installation guide](https://ollama.ai) to install Ollama on your system.

4. **Create and Activate a Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate       # For Linux/Mac
   venv\Scripts\activate          # For Windows
   ```

5. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

6. **Pull the Llama Model**:
   Use Ollama to pull the Llama 3 model:
   ```bash
   ollama pull llama3
   ```

7. **Run the Backend**:
   Start the FastAPI application:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## Folder Structure
```
.
├── frontend/                 # Vite React.js frontend application
├── backend/                  # FastAPI backend application
│   ├── main.py               # Entry point for the FastAPI application
│   ├── requirements.txt      # Backend dependencies
├── data/                     # Directory to store any additional files
└── README.md                 # Project documentation
```

## Usage
- Access the frontend by navigating to the URL displayed after running `npm run dev`.
- Interact with the backend by connecting through `http://localhost:8000`.

## Contributing
Contributions are welcome! Please feel free to fork this repository, submit issues, or create pull requests.


Feel free to share feedback or report issues in the [issues section](<repo-url>).

