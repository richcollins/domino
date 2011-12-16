class Importer
  def self.importPaths(paths)
    baseDir = File.dirname(__FILE__)
    jarPath = baseDir + "/yuicompressor-2.4.7.jar"
    outPath = "#{baseDir}/domino.js"
    compressedOutPath = "#{baseDir}/domino-compressed.js"
    
    open(outPath, "w") do |f|
      f.write(paths.map { |path| open("#{baseDir}/#{path}.js").read }.join("\n"))
    end
    
    cmd = "java -jar #{jarPath} #{outPath} > #{compressedOutPath}"
    #puts cmd
    puts `#{cmd}`
  end
end

eval(open(File.dirname(__FILE__) + "/import.js").read)