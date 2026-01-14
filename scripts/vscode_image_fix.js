const path = require('path');

// Hexo Filter: 兼容 VS Code 的图片路径写法
// 核心逻辑：自动将 Markdown 图片语法转换为 Hexo 的 asset_img 标签
// 支持格式：
// 1. ![alt](文章同名目录/图片.png)  -> 转换为 {% asset_img 图片.png alt %}
// 2. ![alt](image/文章同名目录/图片.png) -> 兼容旧数据，去除多余前缀
hexo.extend.filter.register('before_post_render', function(data) {
    if (!data.asset_dir) return; // 仅在开启 Asset Folder 时生效

    const postFolderName = path.basename(data.source, path.extname(data.source));
    const escapedFolderName = postFolderName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 正则：匹配所有以 文章同名目录 结尾的路径
    // (?:.*\/)? 允许前面有任意目录前缀 (比如 image/)
    const regex = new RegExp(`!\\[(.*?)\\]\\((?:.*\\/)?${escapedFolderName}\\/(.*?)\\)`, 'g');

    data.content = data.content.replace(regex, function(match, alt, filename) {
        try { filename = decodeURIComponent(filename); } catch (e) {}
        
        // 这里的 filename 只是文件名，Hexo 会自动在同名资源文件夹中查找它
        return alt ? `{% asset_img ${filename} ${alt} %}` : `{% asset_img ${filename} %}`;
    });

    return data;
});