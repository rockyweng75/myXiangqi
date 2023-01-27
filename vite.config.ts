import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig(({command, mode}) => {
  // console.log(command, mode)
  // if(command === 'serve'){
  //   return {
  //     build: {
  //       lib: {
  //         entry: './lib/main.ts',
  //         name: 'Xiangqi',
  //         fileName: 'Xiangqi'
  //       },
  //       rollupOptions: {
  //         input: {
  //           main: path.resolve(__dirname, 'index.html'),
  //           nested: path.resolve(__dirname, 'nested/index.html'),
  //         },
  //       },
  //     }
      
  //   }
  // } else {
    return {
      base: '/MyXiangqi/',
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "src"),
        },
      },
      build: {
        lib: {
          entry: './lib/main.ts',
          name: 'Xiangqi',
          fileName: 'Xiangqi',
          formats: ['es']
        },
        server: {
          open: '/index.html'
        },
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
          },
          output: {
            format: 'es',
            dir: 'dist',
          }
        },
      }
    }
  // }

})
