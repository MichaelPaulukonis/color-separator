<template>
  <div>
    <nuxt />
  </div>
</template>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  background-color: #f0f2f5;
  color: #333;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

body {
  min-height: 100vh;
  padding: 0;
  margin: 0;
}

button, 
input, 
select, 
textarea {
  font-family: inherit;
  font-size: 1rem;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
  transition: all 0.3s ease;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
  transition: all 0.3s ease;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

/* Modal styling improvements */
.vm--overlay {
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
}

.vm--modal {
  border-radius: 8px !important;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3) !important;
  padding: 1.5rem !important;
}
</style>
