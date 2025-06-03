pipeline {
    agent any

    environment {
        NODE_HOME = '/usr/local/bin/node' // Path to Node.js, change if needed
        PATH = "${NODE_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Clone Repository') {
            steps {
                // Cloner le dépôt GitHub à chaque exécution de pipeline
                git 'https://github.com/Tristan97411/FitnessApp.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Installer les dépendances du projet avec npm
                    bat 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // Exécuter les tests unitaires avec npm
                    bat 'npm test'
                    }
            }
        }

        //stage('Integration Tests') {
            //steps {
                //cript {
                    // Exécuter les tests d'intégration
                    //bat 'npm run test:integration'

        //stage('Build and Deploy to Staging') {
            //steps {
                
                    // Si tu as une commande de build, ajoute-la ici
                    //bat 'npm run build'
                    // Déployer sur un environnement de staging (simulé)
                    //bat 'npm run deploy:staging'
            //}
        //}

        stage('Deploy to Production') {
    steps {
        script {
            bat 'npm run build:web'
        }
    }
}


    }

    post {
    success {
        emailext(
            subject: '✅ Build réussi - ${JOB_NAME} #${BUILD_NUMBER}',
            body: "Le build du job ${JOB_NAME} #${BUILD_NUMBER} a réussi.\n\nVoir les détails ici : ${BUILD_URL}",
            recipientProviders: [[$class: 'DevelopersRecipientProvider']],
            to: 'saito97411@gmail.com'
        )
    }
    failure {
        emailext(
            subject: '❌ Build échoué - ${JOB_NAME} #${BUILD_NUMBER}',
            body: "Le build du job ${JOB_NAME} #${BUILD_NUMBER} a échoué.\n\nVoir les logs ici : ${BUILD_URL}",
            recipientProviders: [[$class: 'DevelopersRecipientProvider']],
            to: 'saito97411@gmail.com'
        )
    }
    }

}
