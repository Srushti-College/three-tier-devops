pipeline {

    agent any

    environment {
        DOCKERHUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME'

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
                    --build-arg VITE_API_URL=http://192.168.49.2:30050 \
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
                    sed -i 's|YOUR_DOCKERHUB_USERNAME/employee-backend:1.0|${BACKEND_IMAGE}:${IMAGE_TAG}|g' k8s/three-tier.yaml
                """

                sh """
                    sed -i 's|YOUR_DOCKERHUB_USERNAME/employee-frontend:1.0|${FRONTEND_IMAGE}:${IMAGE_TAG}|g' k8s/three-tier.yaml
                """

                sh """
                    kubectl apply -f k8s/three-tier.yaml
                """
            }
        }

        stage('Verify Deployment') {
            steps {

                sh '''
                    kubectl get pods -n three-tier
                    kubectl get services -n three-tier
                '''
            }
        }
    }
}
