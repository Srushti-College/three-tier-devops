pipeline {

    agent any

    environment {
        DOCKERHUB_USERNAME = 'srushti22'

        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/employee-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/employee-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Tools') {
            steps {
                sh '''
                    echo "===== Node ====="
                    node --version

                    echo "===== NPM ====="
                    npm --version

                    echo "===== Docker ====="
                    docker --version

                    echo "===== Kubectl ====="
                    kubectl version --client

                    echo "===== Git ====="
                    git --version
                '''
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {

                sh """
                    docker build \
                    -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                    ./backend
                """

                sh """
                    docker build \
                    -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                    ./frontend
                """
            }
        }

        stage('Docker Login') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                        -u "$DOCKER_USER" \
                        --password-stdin
                    '''
                }
            }
        }

        stage('Push Images') {
            steps {

                sh """
                    docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                """

                sh """
                    docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to Minikube') {
            steps {

                sh """
                    sed -i -E 's|(image: srushti22/employee-backend:).*|\\1${IMAGE_TAG}|' k8s/three-tier.yaml
                """

                sh """
                    sed -i -E 's|(image: srushti22/employee-frontend:).*|\\1${IMAGE_TAG}|' k8s/three-tier.yaml
                """

                sh """
                    kubectl apply -f k8s/three-tier.yaml
                """
            }
        }

        stage('Wait for Rollout') {
            steps {

                sh '''
                    kubectl rollout status deployment/backend -n three-tier
                    kubectl rollout status deployment/frontend -n three-tier
                    kubectl rollout status deployment/postgres -n three-tier
                '''
            }
        }

        stage('Verify Deployment') {
            steps {

                sh '''
                    echo "===== PODS ====="
                    kubectl get pods -n three-tier

                    echo "===== SERVICES ====="
                    kubectl get services -n three-tier

                    echo "===== DEPLOYMENTS ====="
                    kubectl get deployments -n three-tier
                '''
            }
        }
    }

    post {

        success {
            echo 'CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the failed stage logs.'
        }

        always {
            sh 'docker logout || true'
        }
    }
}
