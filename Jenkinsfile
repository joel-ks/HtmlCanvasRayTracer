pipeline {
    agent any
    stages {
        stage ("Build") {
            steps {
                checkout scm

                script {
                    docker.build("rust-base", "--target rust .")
                    docker.build("node-base", "--target node .")
                }
            }
        }

        stage ("Run tests") {
            steps {
                script {
                    docker.build("rust-test", "--target rusttestrunner .").run()
                }
            }
        }

        stage("Publish") {
            steps {
                script {
                    def bundleImg = docker.build("bundle", "--target bundler .")
                    bundleImg.withRun("/bin/sh") {
                        sh 'docker cp ${it.id}:/usr/src/dist/ ./dist/'
                    }
                }

                // This includes the tsconfig.tsbuildinfo incremental build files. TODO: somehow exclude them
                archiveArtifacts artifacts: 'dist/**', onlyIfSuccessful: true
            }
        }
    }
}
