import subprocess
import os
import sys
import time


def run_command(command, cwd=None):
    """Führt einen Befehl in einer Shell aus und gibt den Prozess zurück."""
    return subprocess.Popen(command, shell=True, cwd=cwd)


def main():
    # Pfade zu Backend- undFrontend-Verzeichnissen
    # Passe an, falls anders benannt
    backend_dir = os.path.join(os.path.dirname(__file__), "")
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")

    # Überprüfe, ob Verzeichnisse existieren
    if not os.path.exists(backend_dir):
        print(f"Error: Backend directory {backend_dir} does not exist.")
        sys.exit(1)
    if not os.path.exists(frontend_dir):
        print(f"Error: Frontend directory {frontend_dir} does not exist.")
        sys.exit(1)

    # Starte Django-Server
    print("Starting Django backend...")
    django_cmd = "python manage.py runserver 8000"
    django_process = run_command(django_cmd, cwd=backend_dir)

    # Warte kurz, um sicherzustellen, dass der Django-Server gestartet ist
    time.sleep(2)

    # Starte React-Frontend
    print("Starting React frontend...")
    react_cmd = "npm start"
    react_process = run_command(react_cmd, cwd=frontend_dir)

    # Halte das Skript am Laufen und warte auf Prozessende
    try:
        django_process.wait()
        react_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        django_process.terminate()
        react_process.terminate()


if __name__ == "__main__":
    main()
