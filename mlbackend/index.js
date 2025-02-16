const express = require('express');
const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.text({ type: 'text/csv' }));
app.use(cors({
  origin: 'http://localhost:5173' // اطمینان حاصل کنید که این آدرس صحیح است
}));

const region = "us-east-2"; // بررسی کنید که ریجن صحیح باشد
const sagemakerRuntime = new SageMakerRuntimeClient({ region });

// تابع تبدیل پاسخ SageMaker به رشته
const parseSageMakerResponse = async (Body) => {
  if (!Body) return '';

  if (typeof Body === 'string') {
    return Body.trim();
  }

  if (typeof Body === 'number') {
    return Body.toString(); // تبدیل عدد به رشته
  }

  if (Body instanceof Buffer) {
    return Body.toString('utf-8').trim();
  }

  if (Body instanceof Uint8Array) {
    return Buffer.from(Body).toString('utf-8').trim();
  }

  // پردازش استریم داده
  const chunks = [];
  for await (const chunk of Body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8').trim();
};

app.post('/predict-temperature', async (req, res) => {
  const csvData = req.body;

  if (!csvData) {
    return res.status(400).send('CSV data is required');
  }

  const params = {
    EndpointName: 'canvas-new-deployment-02-14-2025-2-38-PM',
    Body: csvData,
    ContentType: 'text/csv',
  };

  try {
    const command = new InvokeEndpointCommand(params);
    const { Body } = await sagemakerRuntime.send(command);

    // تبدیل `Body` به رشته
    const responseBody = await parseSageMakerResponse(Body);

    // فرض می‌کنیم که پیش‌بینی‌ها به صورت رشته‌ای از مقادیر مختلف است و اولین مقدار پیش‌بینی دما است
    const prediction = responseBody.split(",")[0]; // فقط عدد اول را استخراج می‌کنیم

    // ارسال فقط پیش‌بینی دما
    res.json({ prediction });

  } catch (error) {
    console.error('Error invoking SageMaker endpoint:', error);
    res.status(500).send('Error predicting temperature');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
