pipeline {
    agent any

    environment {
        APP_NAME = "lazisnu-pakiskembar-app"
        APP_URL = "http://127.0.0.1:3002"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Validate') {
            steps {
                sh 'npm run lint'
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -e

                    if docker compose version >/dev/null 2>&1; then
                        COMPOSE="docker compose"
                    elif command -v docker-compose >/dev/null 2>&1; then
                        COMPOSE="docker-compose"
                    else
                        echo "Docker Compose is not installed on this Jenkins server."
                        exit 1
                    fi

                    docker rm -f "$APP_NAME" >/dev/null 2>&1 || true
                    $COMPOSE up -d --build --remove-orphans
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -e
                    for i in $(seq 1 20); do
                        if curl -fsS "$APP_URL" >/dev/null; then
                            echo "Application is healthy at $APP_URL"
                            exit 0
                        fi
                        sleep 2
                    done
                    echo "Application did not become healthy at $APP_URL"
                    docker logs --tail 120 "$APP_NAME" || true
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment success."
        }
        failure {
            echo "Deployment failed. Check Jenkins logs."
        }
    }
}
