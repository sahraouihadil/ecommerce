import smtplib 
from email.mime.text import MIMEText

def send_email(to_email: str, message: str):
  sender_email = "ummkaltumfrd@gmail.com"
  app_password = "rqiu anaz omtd xltl"

  msg = MIMEText(message)
  msg["Subject"] = "Verification Code"
  msg["From"] = sender_email
  msg["To"] = to_email

  try:
    server = smtplib.SMTP("smtp.gmail.com",587)
    server.starttls()
    server.login(sender_email,app_password)
    server.sendmail(sender_email, to_email,msg.as_string())
    server.quit()

    print("Email sent successfully")
  except Exception as e:
    print("Email error:",e)