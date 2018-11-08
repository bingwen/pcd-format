export default {
    input: './src/pcd-format.js',
    plugins: [
    ],
    output: [
        {
            format: 'umd',
            file: 'build/pcd-format.js',
            name: 'pcd-format'
        },
        {
            format: 'es',
            file: 'build/pcd-format.module.js'
        }
    ]
};
