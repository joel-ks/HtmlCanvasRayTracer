//   11665975e26729ac54be68418a5d32354c
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
                archiveArtifacts artifacts: 'dist/**', onlyIfSuccessful: true
            }
        }
    }
}
