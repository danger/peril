### What is the setup for Peril staging?

### Travis CI deploys an ECS Repo

This uses `docker-compose` to (generate a disk image?) which is uploaded to my [Amazon ECS](https://us-west-2.console.aws.amazon.com/ecs/home?region=us-west-2#/repositories).

> Amazon EC2 Container Service (ECS) is a highly scalable, high performance container management service that supports Docker containers and allows you to easily run applications on a managed cluster of Amazon EC2 instances.

(I wonder if this is basically Amazon's copy of docker hub? and that I'm just making work for myself... It does look like the [dockerhub image is updated on master builds](https://hub.docker.com/r/dangersystems/peril/))

For info on ECS, and the overview:

* [Cluster-Based Architectures Using Docker and Amazon EC2 Container Service](https://medium.com/aws-activate-startup-blog/cluster-based-architectures-using-docker-and-amazon-ec2-container-service-f74fa86254bf#.r112qydr6)
* [Running Services Using Docker and Amazon EC2 Container Service](https://medium.com/aws-activate-startup-blog/running-services-using-docker-and-amazon-ec2-container-service-bde16b099cb9#.akhqjhbjw)
* [ECS Get Started](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_GetStarted.html)

### There is a task definition

This is the thing that says what EC2 instances to generate based on any container repo. Environment variables for staging are set here in the [task definition JSON](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_environment). You will need to create a new revision to update the ENV vars


### There is a ECS cluster

This is [Peril](https://us-west-2.console.aws.amazon.com/ecs/home?region=us-west-2#/clusters/peril-staging/services/Peril/tasks) it 


### There is a staging GitHub integration

[Peril Staging](https://github.com/organizations/PerilTest/settings/integrations/peril-staging) only runs against repos in the [PerilTest org](https://github.com/PerilTest), and others cannot run it. The integration's `id` is `1839`, it's key is in my personal 1password.


###  Updating ENV vars

* Update the [peril-staging-task](https://us-west-2.console.aws.amazon.com/ecs/home?region=us-west-2#/taskDefinitions) definition.
* Update [peril-staging](https://us-west-2.console.aws.amazon.com/ecs/home?region=us-west-2#/clusters/peril-staging/services) service.
* Stop running tasks, create new task with updated definition.

There is a Container Instance that will need to has it's task updated to ensure it's on the latest.


### And for production?

Potentially a push to master should update the dockerhub image? https://hub.docker.com/r/dangersystems/peril/

Maybe I can use the staging infra to have a production version? 
