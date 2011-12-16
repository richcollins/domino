class Importer
  def self.importPaths(paths)
    baseDir = File.dirname(__FILE__)
    jarPath = baseDir + "/yuicompressor-2.4.7.jar"
    arg = paths.map { |path| "#{baseDir}/#{path}.js" }.join(" ")
    outPath = "#{baseDir}/domino.js"
    compressedOutPath = "#{baseDir}/domino-compressed.js"
    
    cmd = "cat #{arg} > #{outPath} && java -jar #{jarPath} #{outPath} > #{compressedOutPath}"
    #puts cmd
    puts `#{cmd}`
  end
end

eval(open(File.dirname(__FILE__) + "/import.js").read)