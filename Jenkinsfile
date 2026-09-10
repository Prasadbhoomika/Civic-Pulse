pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'civicpulse'
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Backend CI') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'node --check src/server.js'
                }
            }
        }

        stage('Frontend CI') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Containers') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Integration Smoke Test') {
            steps {
                sh 'JWT_SECRET=jenkins-test-secret docker compose up -d'
                sh '''
                    for i in $(seq 1 30); do
                      if curl -fsS http://localhost:3000/api/health; then exit 0; fi
                      sleep 2
                    done
                    docker compose logs
                    exit 1
                '''
            }
            post {
                always {
                    sh 'docker compose down -v || true'
                }
            }
        }
    }
}
