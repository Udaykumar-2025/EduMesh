import React, { useState } from 'react';
import { Upload, Download, FileText, Users, GraduationCap, X, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { dbOperations, Student, Teacher } from '../../lib/supabase';
import Card from '../shared/Card';

interface BulkUploadProps {
  type: 'students' | 'teachers';
  schoolId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkUpload({ type, schoolId, onClose, onSuccess }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const downloadTemplate = () => {
    let templateData: any[] = [];
    let filename = '';

    if (type === 'students') {
      templateData = [
        {
          'Student Name': 'John Doe',
          'Email': 'john.doe@student.school.edu',
          'Phone': '+1-555-0123',
          'Student ID': 'S001',
          'Class': '10A',
          'Roll Number': '001',
          'Date of Birth': '2008-05-15',
          'Parent Name': 'Jane Doe',
          'Parent Email': 'jane.doe@parent.com',
          'Parent Phone': '+1-555-0124'
        }
      ];
      filename = 'students_template.xlsx';
    } else {
      templateData = [
        {
          'Teacher Name': 'Sarah Johnson',
          'Email': 'sarah.johnson@school.edu',
          'Phone': '+1-555-0101',
          'Employee ID': 'T001',
          'Qualification': 'M.Sc Mathematics',
          'Experience Years': '5',
          'Subjects': 'Mathematics,Physics'
        }
      ];
      filename = 'teachers_template.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'students' ? 'Students' : 'Teachers');
    XLSX.writeFile(wb, filename);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setPreviewData(jsonData.slice(0, 5)); // Show first 5 rows for preview
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please make sure it\'s a valid Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processStudentData = (data: any[]): Student[] => {
    return data.map((row, index) => ({
      school_id: schoolId,
      name: row['Student Name'] || row['Name'] || '',
      email: row['Email'] || '',
      phone: row['Phone'] || '',
      student_id: row['Student ID'] || row['ID'] || `S${String(index + 1).padStart(3, '0')}`,
      class_name: row['Class'] || row['Class Name'] || '',
      roll_number: row['Roll Number'] || row['Roll'] || String(index + 1),
      date_of_birth: row['Date of Birth'] || row['DOB'] || '',
      parent_name: row['Parent Name'] || '',
      parent_email: row['Parent Email'] || '',
      parent_phone: row['Parent Phone'] || ''
    }));
  };

  const processTeacherData = (data: any[]): Teacher[] => {
    return data.map((row, index) => ({
      school_id: schoolId,
      name: row['Teacher Name'] || row['Name'] || '',
      email: row['Email'] || '',
      phone: row['Phone'] || '',
      employee_id: row['Employee ID'] || row['ID'] || `T${String(index + 1).padStart(3, '0')}`,
      qualification: row['Qualification'] || '',
      experience_years: parseInt(row['Experience Years'] || row['Experience'] || '0'),
      subjects: row['Subjects'] ? row['Subjects'].split(',').map((s: string) => s.trim()) : []
    }));
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let results;
          if (type === 'students') {
            const students = processStudentData(jsonData);
            results = await dbOperations.bulkAddStudents(students);
          } else {
            const teachers = processTeacherData(jsonData);
            results = await dbOperations.bulkAddTeachers(teachers);
          }

          setUploadResults(results);
          if (results.errors.length === 0) {
            onSuccess();
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('Error processing file. Please check the format and try again.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {type === 'students' ? (
                <GraduationCap className="text-blue-600" size={24} />
              ) : (
                <Users className="text-green-600" size={24} />
              )}
              <h2 className="text-xl font-semibold">
                Bulk Upload {type === 'students' ? 'Students' : 'Teachers'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {!uploadResults ? (
            <>
              {/* Download Template */}
              <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Download className="text-blue-600" size={20} />
                    <div>
                      <h3 className="font-medium text-gray-900">Download Template</h3>
                      <p className="text-sm text-gray-600">
                        Download the Excel template with the correct format
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download Template
                  </button>
                </div>
              </Card>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Excel File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your Excel file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                  >
                    Choose File
                  </label>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              {/* Preview Data */}
              {previewData.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Preview Data</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(previewData[0]).map((key) => (
                            <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => (
                          <tr key={index} className="border-b">
                            {Object.values(row).map((value: any, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-2 text-sm text-gray-600">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Showing first 5 rows. Total rows in file: {previewData.length}
                  </p>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Upload {type}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Upload Results */
            <div>
              <div className="text-center mb-6">
                {uploadResults.errors.length === 0 ? (
                  <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
                ) : (
                  <AlertCircle className="mx-auto text-yellow-500 mb-2" size={48} />
                )}
                <h3 className="text-lg font-semibold text-gray-900">Upload Complete</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{uploadResults.results.length}</p>
                    <p className="text-sm text-gray-600">Successfully Added</p>
                  </div>
                </Card>
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{uploadResults.errors.length}</p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                </Card>
              </div>

              {uploadResults.errors.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Errors:</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {uploadResults.errors.map((error: any, index: number) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded mb-2">
                        <p className="text-sm text-red-800">
                          {type === 'students' ? error.student.name : error.teacher.name}: {error.error}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}