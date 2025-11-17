FROM digitranslab/flowai:1.0-alpha

CMD ["python", "-m", "flowai", "run", "--host", "0.0.0.0", "--port", "7860"]
