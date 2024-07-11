pipeline {
    agent any
    stages {
        stage ("Build") {
            steps {
                checkout scm

                nodejs(nodeJSInstallationName: 'Node 20.15') {
                    sh 'npm clean-install'
                    sh 'npm run build -- --sourceMap false'
                }
            }
        }

        stage("Publish") {
            steps {
                sh 'cp wwwroot/index.html .'
                sh 'cp -R wwwroot/js .'
                archiveArtifacts artifacts: 'index.html, js/**/**.js', onlyIfSuccessful: true
            }
        }
    }
}
