FROM digitranslab/minerva:1.0-alpha

CMD ["python", "-m", "minerva", "run", "--host", "0.0.0.0", "--port", "7860"]
