pipeline {
  agent any

  environment {
    DOCKER_HUB_REPO = 'princenarayanan/speakease-backend'
    ECR_REPO = '636768524979.dkr.ecr.us-west-1.amazonaws.com/capstone'
    AWS_REGION = 'us-west-1'
    CLUSTER_NAME = 'speakease-cluster'
    BACKEND_DEPLOYMENT_FILE = './app-deployment.yaml'
    MONGO_DEPLOYMENT_FILE = './mongo-deployment.yaml'
  }

  triggers {
    githubPush()
  }

  stages {
    stage('Checkout Code') {
      steps {
        git branch: 'master', url: 'https://github.com/Narayanan-cap/SpeakEase-Project.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh "docker build -t ${DOCKER_HUB_REPO}:${env.BUILD_NUMBER} ."
      }
    }

    stage('Login to Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'Docker_Credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        sh "docker push ${DOCKER_HUB_REPO}:${env.BUILD_NUMBER}"
      }
    }

    stage('Login to AWS ECR') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'AWS_Credentials']]) {
          sh '''
            aws ecr get-login-password --region $AWS_REGION | \
            docker login --username AWS --password-stdin $ECR_REPO
          '''
        }
      }
    }

    stage('Tag and Push to ECR') {
      steps {
        script {
          def ecrImage = "${ECR_REPO}:${env.BUILD_NUMBER}"
          sh """
            docker tag ${DOCKER_HUB_REPO}:${env.BUILD_NUMBER} ${ecrImage}
            docker push ${ecrImage}
          """
        }
      }
    }

    stage('Prepare Deployment YAML') {
      steps {
        script {
          def yaml = readFile(file: BACKEND_DEPLOYMENT_FILE)
          def updatedYaml = yaml.replaceAll(/(?s)readinessProbe:.*?periodSeconds: \\d+\\n/, '')
          writeFile(file: 'backend-deployment-no-readiness.yaml', text: updatedYaml)
        }
      }
    }

    stage('Deploy to EKS') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'AWS_Credentials']]) {
          sh """
            aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}
            kubectl apply -f ${MONGO_DEPLOYMENT_FILE}
            kubectl rollout status deployment/mongo-deployment
            kubectl apply -f backend-deployment-no-readiness.yaml
            kubectl rollout status deployment/backend-deployment
          """
        }
      }
    }

    stage('Get LoadBalancer IP') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'AWS_Credentials']]) {
          script {
            def backendLB = sh(script: "kubectl get svc backend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'", returnStdout: true).trim()
            echo "🌐 Backend LoadBalancer URL: http://${backendLB}"
          }
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deployment to EKS successful!"
    }
    failure {
      echo "❌ Deployment failed. Check logs for details."
    }
  }
}