# Deployment Workshop - Docker, Digital Ocean

Docker is a software container platform

Today we’re going to create a Docker container for the app that we built in Short Assignment 7, and then we’re going to deploy this container on Digital Ocean.

Be sure to look out for the following notations:
* :computer: run in terminal
* :rocket: this is a key step

:rocket: Install docker for mac os or windows:

[Mac OS](https://store.docker.com/editions/community/docker-ce-desktop-mac?tab=description)

Windows users should download [Docker Toolbox](https://www.docker.com/products/docker-toolbox)
(You only need Docker Machine, no need to install any of the other options.)

[Ubuntu](https://store.docker.com/editions/community/docker-ce-server-ubuntu?tab=description)

## Setup Accounts

:rocket: Create a [Digital Ocean](https://www.digitalocean.com/) account. It will ask for credit card information, but if your [Github Education Pack](https://education.github.com/pack) has a promo code that gives you a $50 credit which is much more than you need for this workshop.

:rocket: After that, head on over to [Docker Hub](https://hub.docker.com/) and create a free account there as well.

Now we will work on building a Docker container for the app we built in Short Assignment 7. This repo contains a working copy of it. :rocket: If you are using your own SA7 code, make the following change in server.js:

```
const mongoURI = 'mongodb://' + process.env.MONGODB_PORT_27017_TCP_ADDR + ':' +
                  process.env.MONGODB_PORT_27017_TCP_PORT + '/cs52poll';
```

We will have our app running in one Docker container, and Mongodb running in another and then link them together, and this is used so that our app is looking in the correct place for the database.

NOTE: In the following if you get the error “Cannot connect to the Docker daemon”, then prefix any docker commands with sudo.

## Building the Docker Image

:rocket: Create an empty file Dockerfile at the top level of your app directory and open it in Atom.

In the file you want the following:

```
FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 9090

CMD [ "npm", "run", "dev" ]
```

:rocket: Now, create a .dockerignore file containing

```
node_modules
npm-debug.log
```

:computer:  Build the image:
Note: replace username with your docker username

```
$ docker build -t username/sa7-app .
```

(Don’t forget the period at the end of the command!)

Be prepared for this to download lots of files as it builds your image for you.

:computer: Run the image:

```
$ docker run -p 8080:9090 -d username/sa7-app
```


But…. this **doesn’t work** because it is not connected to a database. (You may see a string of letters and numbers displayed on your terminal window. That’s normal! The string is actually the container ID of the container in which this image is running)

The -p option takes port 9090 of the container and exposes it on port 8080 on your localhost.
The -d option runs it in detached mode so that it can continue even if you log out.

### Docker Commands:
View the running docker containers
```
$ docker ps
```

View current and past running docker containers:

```
$ docker ps -a
```
Print app output:

```
$ docker logs <container id>
```

Note: you will see an error that ends with this:

```
[nodemon] app crashed - waiting for file changes before starting…
```

:computer: Now halt your app container for now, we’ll start it back up in a few minutes

```
$ docker stop <container id>
```

Side Note:
You can connect to a running Docker container and run commands within it

```
$ docker exec -it <container id> bash
```

Or

```
$ docker exec -it <container name> bash
```



## Getting Mongo running in a Docker container:

Your app wasn’t working in the container before because it was looking for a MongoDB database to connect to, but couldn’t find one. So we’re going to get one running in a separate container and link the two.

:computer: Pull the latest Mongo image from Docker Hub:

```
$ docker pull mongo:latest
```

:computer: Make a data directory in this folder:

```
$ mkdir $(pwd)/data
```

:computer: Run the Mongo container:

```
$ docker run -v $(pwd)/data --name mongo -d mongo mongod --smallfiles
```


Now that you have a container with Mongo up and running, you can link it to your app.

:computer: Run your application connected to Mongo (Make sure to stop any previous instances):

```
$ docker run -p 8080:9090 --link mongo:mongodb -d username/sa7-app
```

You should now be able to go to http://localhost:8080/ and view the app. But wait, isn’t this what we already had? Yes, so now it is time to upload our newly built Docker container to Docker Hub so that we can deploy it anywhere.

:rocket: In [Docker Hub](https://hub.docker.com/), create a new repository with the same name as your app and give it whatever description you like. :computer: Then in Terminal, run
```
$ docker login
```

and use your Docker Hub credentials.

After you are logged in, push it to Docker Hub with a simple

```
$ docker push username/sa7-app
```

(this may take some time depending on your upload speed)

While that is uploading, let’s set up a droplet on [Digital Ocean](https://www.digitalocean.com/).

## Digital Ocean

After logging in, there should be an option to Create a Droplet. Click that, and we’ll go through the process of setting up a simple Droplet with Docker set up.

:rocket: Click the “Create Droplet” button. Then click the tab for “One-click apps” (right below “Choose an image”)

![](https://github.com/dylansc/deployment_workshop/blob/master/img/digitalocean1.png)

and choose Docker 17.04.0-ce on 16.04.

![](https://github.com/dylansc/deployment_workshop/blob/master/img/digitalocean2.png)

:rocket: Scroll down and choose the $5/mo option, and it is fine to leave the rest at the defaults. Click create and it will bring you back to the Droplets screen and after a few moments the newly created droplet will appear.

:computer: You will receive an email with the IP and the root password, which you will use to

```
$ ssh root@<server ip>
```

(Wait until your droplet finishes setting up and run the above ssh to login to your droplet. You can find the server ip in your droplet dashboard )

:computer: Upon login you will be prompted to enter the root password which you received in the email.

You will see

```
Changing password for root.
(current) UNIX password:
```

:computer: Just enter that password again and then set up a new password.

Now, if your Docker container has successfully been pushed to Docker Hub, then it is time to set it up here.

:computer: Run the following commands while logged into root:

```
$ docker pull mongo:latest
$ docker pull username/sa7-app
$ mkdir ~/data
$ docker run -v ~/data:/data --name mongo -d mongo mongod --smallfiles
$ docker run -p 80:9090 --link mongo:mongodb -d username/sa7-app
```

Celebrate!!!
This time we are exposing the container on port 80, so if you go to the server ip in your browser then you should be greeted with your app!

Procedure Overview
Create a Dockerfile and .dockerignore in your local project repository.
Build the docker image for the project.
Pull the mongodb docker image, run it and then link it to the project image.
Test your project in localhost:8080.
Push your project image to Docker Hub.
Create a docker droplet in Digital Ocean.
Ssh to your server and pull the mongodb image, your project image.
Run the mongodb image first then link it with your project image.
Copy and paste the ip address of your server into your browser and Have a look!
You’re done with deploying your project image in Digital Ocean!

Checklist
:white_check_mark: Installed Docker and build a docker image for your sa7.
:white_check_mark: Tested your project image with the mongodb image locally.
:white_check_mark: Pushed your project image to Docker Hub.
:white_check_mark: Set up your docker droplet in Digital Ocean.
:white_check_mark: Pulled your project image and mongo db image in your server and linked them. Then you made it happen!


There’s more

References:
https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
http://www.ifdattic.com/how-to-mongodb-nodejs-docker/
https://www.thachmai.info/2015/05/10/docker-container-linking-mongo-node/
