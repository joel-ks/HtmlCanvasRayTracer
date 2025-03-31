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
                    def testrunnerImg = docker.build("rust-test", "--target rusttestrunner .")
                    testrunnerImg.run("--rm")
                }
            }
        }

        stage("Publish") {
            steps {
                script {
                    def bundleImg = docker.build("bundle", "--target bundler .")
                    bundleImg.withRun("--rm", "/bin/sh") {
                        sh 'docker cp ${it.id}:/usr/src/dist/ ./dist/'
                    }
                }

                // This includes the tsconfig.tsbuildinfo incremental build files. TODO: somehow exclude them
                archiveArtifacts artifacts: 'dist/**', onlyIfSuccessful: true
            }
        }
    }
}
