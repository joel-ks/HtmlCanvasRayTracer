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

                    // TODO: how to publish pass/coverage reports
                    // testrunnerImg.withRun {
                    //     sh "docker logs --follow ${it.id}"
                    // }
                    sh "docker run --rm ${testrunnerImg.id}"
                }
            }
        }

        stage("Publish") {
            steps {
                script {
                    def bundleImg = docker.build("bundle", "--target bundler .")
                    bundleImg.withRun("", "/bin/sh") {
                        sh "docker cp ${it.id}:/usr/src/dist ./dist"
                    }
                }

                archiveArtifacts artifacts: "dist/**", onlyIfSuccessful: true
            }
        }
    }

    post {
        cleanup {
            sh "docker image prune --all --force"
        }
    }
}
