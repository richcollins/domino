#!/usr/bin/env ruby

require 'optparse'

class Importer
  attr_accessor :base_paths
  attr_accessor :in_paths
  attr_accessor :yui_compressor_path
  attr_accessor :out_path
  
  attr_accessor :base_path
  attr_accessor :javascript_chunks
  attr_accessor :runs_commands
  
  @@shared = nil
  
  def self.shared
    if @@shared == nil
      @@shared = Importer.new
    end
    @@shared
  end
  
  def self.importPaths(paths)
    self.shared.import_paths(paths)
  end
  
  def extendBasePath(path)
    self.base_path = base_path + "/" + path
    self
  end
  
  def importPaths(paths)
    import_paths(paths)
  end
  
  def self.clone
    Importer.shared.clone
  end
  
  def clone
    importer = Importer.new
    importer.in_paths = in_paths
    importer.yui_compressor_path = yui_compressor_path
    importer.out_path = out_path
    importer.base_path = base_path
    importer
  end
  
  def initialize
    base_path = File.dirname(__FILE__)
    self.runs_commands = true
    self.in_paths = [base_path + "/import.js"]
    self.yui_compressor_path = base_path + "/yuicompressor-2.4.7.jar"
    self.out_path = base_path + "/domino.js"
    self.javascript_chunks = []
  end
  
  def import_paths(paths)
    paths.each do |path|
      import_path(path)
    end
    self
  end
  
  def import_path(path)
    contents = open("#{base_path}/#{path}.js").read
    if File.basename(path) == "import"
      Importer.shared.send(:eval, contents)
    else
      Importer.shared.javascript_chunks << contents
    end
  end
  
  def concat
    if runs_commands
      open(out_path, "w") do |f|
        f.write(Importer.shared.javascript_chunks.join("\n"))
      end
    end
  end
  
  def compress
    compressed_out_path = out_path.gsub(/\.js$/, '-compressed.js')
    cmd = "java -jar #{yui_compressor_path} #{out_path} -o #{compressed_out_path}"
    puts cmd
    `#{cmd}` if runs_commands
  end
  
  def run
    in_paths.each_with_index do |in_path, i|
      self.base_path = base_paths ? base_paths[i] : File.dirname(in_path)
      self.send(:eval, open(in_path).read)
    end
    concat
    compress
  end
  
  def dm
    self
  end
  
  def Importer
    self
  end
end

importer = Importer.shared
#importer.runs_commands = false

OptionParser.new do |opts|
  opts.on('-i', '--input-paths x,y,z', 'Input Paths') do |in_paths|
    importer.in_paths = in_paths.split(",")
  end
  
  opts.on('-b', '--base-paths x,y,z', 'Base Paths') do |base_paths|
    importer.base_paths = base_paths.split(",")
  end

  opts.on('-y', '--yui-compressor-path PATH', 'YUI Compressor Path') do |path|
    importer.yui_compressor_path = path
  end

  opts.on('-o', '--out-path [PATH]', 'Output Path') do |out_path|
    importer.out_path = out_path
  end
end.parse!

importer.run