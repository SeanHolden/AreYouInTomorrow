#Are You In Tomorrow?


##What is this?

A service to find out who is in the office this week and who is working from home.

##How does it work?

The app gathers data from members of a particular work team about whether they will be in the office or not on any given day. The data is gathered by sending an SMS to each member once per week, containing a short link. This short link will lead the member to a web form to set the days of the week that they will be present in the office. This data is then submitted, along with all other members. 

The result will be a viewable page containing days of the week (Monday to Friday) and underneath each day, the names of the people who will be in the office on that day.

##Setup and usage instructions...

####Environment variables needed:

__Before running this app, you will need to set the following environment variables.__

* `TWILIO_ACCOUNT_SID` (_Get this by creating a twilio account._)
* `TWILIO_AUTH_TOKEN` (_Get this by creating a twilio account._)
* `TWILIO_PHONE_NO` (_Get this by creating a twilio account._)
* `BITLY_ACCESS_TOKEN` (_Get this by creating a bitly account._)
* `ROOT_URL` (_The root path to this app. e.g. http://www.example.com._)
* `DATABASE_URL` (_URL to your database._)
* `REQUEST_TOKEN` (_randomly generated token to ensure post requests can't just come from anywhere. This can be whatever you want it to be._)

---


###Create users

First, create a user by sending a POST request to: `/api/create-user`. Parameters needed are: `firstname`, `lastname` and `msisdn`.

#####Example:

```
curl \
-X POST \
-d "firstname=John&lastname=Doe&msisdn=07012345678" \
http://your.root.url/api/create-user
```
__Response__

On success: `'Thanks, new user created.'`

On error: `'Invalid request -> error_details_will_be_here`

---

###Send SMS to all users

Send a POST request to `/api/send-sms`. Parameters needed are: `token`. The value of the `token` must be whatever you set your `SMS_REQUEST_TOKEN` environment variable to. This is to ensure the request doesn't come from elsewhere.

#####Example:

```
curl \
-X POST \
-d "token=eXaMpL3T0k3N" \
http://your.root.url/api/send-sms
```

__Response__

On success: `Done sending SMS.`

If invalid token sent: `Did not get correct token in params.`

---

###View who is in this week

Get a JSON response containing info on who is in the office this week. This can then be used to create a friendly looking view in a webpage.

#####Example:

```
curl \
http://your.root.url/api/whosinthisweek?token==eXaMpL3T0k3N
```
__Response__

On success:

```
[
    {
        "date": "2013-8-26",
        "whosin": [
            "John",
            "Jane"
        ]
    },
    {
        "date": "2013-8-27",
        "whosin": [
            "John"
        ]
    },
    {
        "date": "2013-8-28",
        "whosin": [
            "Jane"
        ]
    },
    {
        "date": "2013-8-29",
        "whosin": []
    },
    {
        "date": "2013-8-30",
        "whosin": [
            "John",
            "Jane",
            "Steve"         
        ]
    }
]
```

On error: `Did not get correct token in params.`

---

###Reset tokens and shortlinks

The shortlinks sent by SMS that the user clicks on send the user to the submit week page with a unique token that belongs to only that user. This is how the app identifies the user. This means that the user does not have to log in to verify who they are when they click on the shortlink. Ideally, this token should be reset each week before sending the SMS out. That way, if somebody gets hold of another user's token, it will expire before the end of the week anyway.

To reset tokens and shortlinks for all users:

#####Example:

```
curl \
-X POST \
-d "token=eXaMpL3T0k3N" \
http://your.root.url/api/reset-tokens
```

__Response__

On success: `Tokens and shortlinks reset.`

If invalid token sent: `Did not get correct token in params.`
