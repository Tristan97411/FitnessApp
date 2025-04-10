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
                    // Déployer sur l'environnement de production uniquement si tout est OK
                    // Exécuter uniquement si tous les tests sont réussis
                    bat 'npm run dev'
                }
            }
        }
    }

    post {
        success {
            echo 'Build réussi et déploiement effectué'
            emailext(
                subject: "✅ Build réussi : ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Le pipeline Jenkins s'est terminé avec succès.\n\nProjet : ${env.JOB_NAME}\nBuild : #${env.BUILD_NUMBER}\nVoir les détails : ${env.BUILD_URL}",
                to: 'saito97411@hotmail.fr'
            )
        }

        failure {
            echo 'Le build a échoué'
            emailext(
                subject: "❌ Échec du build : ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Le pipeline Jenkins a échoué.\n\nProjet : ${env.JOB_NAME}\nBuild : #${env.BUILD_NUMBER}\nVoir les détails : ${env.BUILD_URL}",
                to: 'saito97411@hotmail.fr'
            )
        }
    }
}
