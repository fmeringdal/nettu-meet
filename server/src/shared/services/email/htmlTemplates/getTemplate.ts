const email_verification_template = `
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        
    <style>
        *{
            margin: 0;
            padding: 0;
        }
        p, h3, a, span{
            font-family: Roboto;    
        }
        .flex-center{
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #banner {
            width: 100%;
            height: 90px;
        }
        #banner img{
            width: 120px;
            object-fit: contain;
            margin: 0 auto;
            display: block;
        }
        .helpertext{
            color: #a4a5b2;
            font-size: 0.85rem;
            text-align: left;
            font-weight: 400;
            margin: 0 20px;
            padding-left: 20px;
        }
        .container{
            margin: 0 20px;
            margin-top: 5px;
        }
        .main{
            border-top: 2px solid #ededed;
            border-bottom: 2px solid #ededed;
            width: 100%;
            padding: 30px 20px;
            background-color: #f9f9f9;
            box-sizing: border-box;
        }
        .welcome-tite{
            color: #323e49;
            font-weight: bold;
            font-size: 1.3rem;
            margin: 0 0 15px 0;
            text-align: left;
        }
        .welcome-description{
            font-size: 1rem;
            font-weight: 400;
            text-align: left;
            line-height: 23px;
            color: #586069;
        }
        .actionbtn{
            background-color: #3f51b5;
            width: 140px;
            text-decoration: none;
            padding: 8px 22px;
            border-radius: 4px;
            overflow: hidden;
            margin: 30px auto 0 auto;
            cursor: pointer;
            text-decoration: none;
            font-size: 0.9375rem;
            letter-spacing: 0.02857em;
            color: #fff;
            box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
        }
        .actionbtn:hover{
            background-color: #6977c9;
        }
    </style>
    </head>
    <body>
        <div id="banner" class="flex-center">
            <img src="https://nettu-company-assets.s3-eu-west-1.amazonaws.com/NettuMeetingLogo.png" alt="NETTU"/>
        </div>
        <p class="helpertext">Nettu Meet conference solution</p>
        <div class="container">
            <div class="main">
                <h3 class="welcome-tite">Hi,</h3>
                <p class="welcome-description">Your email confirmation code for Nettumeet is <b>{{code}}</b>.</p>
            </div>
        </div>
    </body>
</html>`;

const insertValuesToTemplate = (contents: string, params: { [key: string]: string }) => {
    for (const key in params) {
        const REPLACEMENT_STRING = '{{' + key + '}}';
        while (contents.includes(REPLACEMENT_STRING)) {
            contents = contents.replace(REPLACEMENT_STRING, params[key]);
        }
    }
    return contents;
};

export interface IEmailVerificationCodeParams {
    code: string;
}

export const getEmailConfirmationTemplate = (params: IEmailVerificationCodeParams): string => {
    return insertValuesToTemplate(email_verification_template, { ...params });
};
