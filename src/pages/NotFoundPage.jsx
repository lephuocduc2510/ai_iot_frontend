import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { SentimentDissatisfied } from '@mui/icons-material';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 5
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 500
          }}
        >
          <SentimentDissatisfied sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
          
          <Typography variant="h1" component="h1" color="primary" sx={{ fontSize: { xs: 100, sm: 150 }, fontWeight: 'bold', lineHeight: 1 }}>
            404
          </Typography>
          
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Không tìm thấy trang
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến vị trí khác.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              color="primary"
              size="large"
            >
              Quay về trang chủ
            </Button>
            
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              size="large"
            >
              Đăng nhập
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;