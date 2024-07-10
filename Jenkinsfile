pipeline {
    agent any
    stages {
        stage ("Build") {
            steps {
                checkout scm

                nodejs(nodeJSInstallationName: 'Node 20.15') {
                    sh 'npm clean-install'
                    sh 'npm run build'
                }
            }
        }

        stage("Publish") {
            steps {
                sh 'mkdir dist'
                sh 'cp wwwroot/index.html dist/'
                sh 'cp -R wwwroot/js/ dist/js/'
                tar file: 'content.tar.gz' dir: 'dist' compress: true archive: true
            }
        }
    }
}
